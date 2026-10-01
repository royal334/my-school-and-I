// app/api/admin/accommodation/transactions/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { cancelActiveViewingsForUnit } from '@/utils/lib/services/accommodation-viewings';

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['super_admin', 'admin'])
    .single();
  return !!data;
}

// POST /api/admin/accommodation/transactions
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { unit_id, property_id, student_id, viewing_id, rent_amount } = body;

    if (!unit_id || !property_id || !student_id) {
      return NextResponse.json({ error: 'unit_id, property_id and student_id are required' }, { status: 400 });
    }

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('accommodation_transactions')
      .insert({
        unit_id,
        property_id,
        student_id,
        viewing_id: viewing_id || null,
        rent_amount: rent_amount || null,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) throw txError;

    // Mark unit as rented
    const { error: unitUpdateError } = await supabase
      .from('accommodation_units')
      .update({
        availability_status: 'rented',
        updated_at: new Date().toISOString(),
      })
      .eq('id', unit_id);

    if (unitUpdateError) throw unitUpdateError;

    const viewingCancellations = await cancelActiveViewingsForUnit(unit_id, 'rented');

    // Find the oldest approved submission linked to this rented unit.
    const { data: submission, error: submissionError } = await supabase
      .from('accommodation_submissions')
      .select('id, submitted_by')
      .eq('matched_unit_id', unit_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    let referralCreated = false;
    let referralIssue: 'lookup_failed' | 'no_matching_submission' | 'missing_submitter' | 'upsert_failed' | null = null;

    if (submissionError) {
      console.error('Referral submission lookup failed:', {
        transaction_id: transaction.id,
        unit_id,
        error: submissionError,
      });
      referralIssue = 'lookup_failed';
    } else if (!submission) {
      console.warn('No approved accommodation submission is linked to the rented unit:', {
        transaction_id: transaction.id,
        unit_id,
      });
      referralIssue = 'no_matching_submission';
    } else if (!submission.submitted_by) {
      console.error('Approved accommodation submission has no submitter:', {
        submission_id: submission.id,
        transaction_id: transaction.id,
      });
      referralIssue = 'missing_submitter';
    } else {
      const { error: referralError } = await supabase
        .from('accommodation_referrals')
        .upsert({
          referrer_id: submission.submitted_by,
          submission_id: submission.id,
          unit_id,
          transaction_id: transaction.id,
          eligibility_status: 'eligible',
          payout_status: 'unpaid',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'submission_id' });

      if (referralError) {
        console.error('Accommodation referral upsert failed:', {
          submission_id: submission.id,
          transaction_id: transaction.id,
          error: referralError,
        });
        referralIssue = 'upsert_failed';
      } else {
        referralCreated = true;

        const { sendNotification } = await import('@/utils/lib/services/notification-service');
        sendNotification({
          userId: submission.submitted_by,
          type: 'accommodation',
          title: '🎉 Referral reward incoming!',
          body: 'A property you reported has been rented. Add your bank details in Profile & Settings so your referral reward can be processed.',
          data: {
            transaction_id: transaction.id,
            deeplink: '/dashboard/profile',
          },
        }).catch(console.error);
      }
    }

    // Notify student
    const { sendNotification } = await import('@/utils/lib/services/notification-service');
    sendNotification({
      userId: student_id,
      type: 'accommodation',
      title: 'Transaction confirmed',
      body: 'Your accommodation transaction has been confirmed. Welcome to your new home!',
      data: { transaction_id: transaction.id },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      transaction,
      viewingCancellations,
      referral: {
        created: referralCreated,
        issue: referralIssue,
      },
      message: referralCreated
        ? 'Transaction created, unit marked as rented, and referral created.'
        : 'Transaction created and unit marked as rented, but no referral was created.',
    });
  } catch (error: any) {
    console.error('Transaction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/admin/accommodation/transactions
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: transactions, error } = await supabase
      .from('accommodation_transactions')
      .select(`
        *,
        unit:accommodation_units (
          id, unit_number, room_type,
          property:accommodation_properties (id, name, area)
        ),
        referral:accommodation_referrals (
          id, referrer_id, eligibility_status, payout_status, reward_amount
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    type NestedReferral = Record<string, unknown> & { referrer_id: string };
    type TransactionWithReferrals = Record<string, unknown> & {
      referral: NestedReferral | NestedReferral[] | null;
    };

    const transactionRows = (transactions || []) as TransactionWithReferrals[];
    const nestedReferrals = transactionRows.flatMap((transaction) =>
      Array.isArray(transaction.referral)
        ? transaction.referral
        : transaction.referral
          ? [transaction.referral]
          : [],
    );
    const referrerIds = [
      ...new Set(nestedReferrals.map((referral) => referral.referrer_id)),
    ];
    const { data: referrerProfiles, error: profilesError } = referrerIds.length
      ? await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', referrerIds)
      : { data: [], error: null };

    if (profilesError) throw profilesError;

    const referrersByUserId: Record<string, { id: string; full_name: string | null }> =
      Object.fromEntries(
        (referrerProfiles || []).map((profile) => [profile.id, profile]),
      );

    return NextResponse.json({
      transactions: transactionRows.map((transaction) => ({
        ...transaction,
        referral: Array.isArray(transaction.referral)
          ? transaction.referral.map((referral) => ({
              ...referral,
              referrer: referrersByUserId[referral.referrer_id] || null,
            }))
          : transaction.referral
            ? {
                ...transaction.referral,
                referrer: referrersByUserId[transaction.referral.referrer_id] || null,
              }
            : null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}