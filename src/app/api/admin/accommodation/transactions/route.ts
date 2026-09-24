// app/api/admin/accommodation/transactions/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
    await supabase
      .from('accommodation_units')
      .update({
        availability_status: 'rented',
        updated_at: new Date().toISOString(),
      })
      .eq('id', unit_id);

    // Find referral for this unit and mark as eligible
    const { data: submission } = await supabase
      .from('accommodation_submissions')
      .select('id, submitted_by')
      .eq('matched_unit_id', unit_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (submission) {
      // Create or update referral record
      await supabase
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

      // Notify referrer
      const { sendNotification } = await import('@/utils/lib/services/notification-service');
      sendNotification({
        userId: submission.submitted_by,
        type: 'accommodation',
        title: '🎉 Referral reward incoming!',
        body: 'A property you reported has been rented through CampusHub. Your reward is being processed.',
        data: { transaction_id: transaction.id },
      }).catch(console.error);
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
      message: 'Transaction created, unit marked as rented, referral triggered.',
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
          id, eligibility_status, payout_status, reward_amount,
          referrer:profiles!accommodation_referrals_referrer_id_fkey (full_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ transactions: transactions || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}