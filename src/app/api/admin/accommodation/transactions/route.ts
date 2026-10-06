// app/api/admin/accommodation/transactions/route.ts
// REPLACES existing admin-accommodation-transactions-route.ts
// Added: 20% markup calculation, referrer_type detection (agent vs student),
// commission splitting, agent_commission_records creation

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

async function isAdmin(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['super_admin', 'admin'])
    .single();
  return !!data;
}

// POST /api/admin/accommodation/transactions
// Creates a completed rental transaction with full commission calculation
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      unit_id,
      property_id,
      student_id,
      viewing_id,
      landlord_rent_amount, // Base rent landlord receives (in Naira, NOT kobo)
      notes,
    } = body;

    if (!unit_id || !property_id || !student_id || !landlord_rent_amount) {
      return NextResponse.json(
        { error: 'unit_id, property_id, student_id and landlord_rent_amount are required' },
        { status: 400 }
      );
    }

    const landlordRentNaira = parseFloat(landlord_rent_amount);
    if (isNaN(landlordRentNaira) || landlordRentNaira <= 0) {
      return NextResponse.json({ error: 'Invalid landlord_rent_amount' }, { status: 400 });
    }

    // ── Commission calculation (server-side only, never from client) ──────────
    // All amounts stored in kobo (× 100) as integers to avoid floating point
    const landlordRentMinor = Math.round(landlordRentNaira * 100);

    // Call the DB function for authoritative calculation
    const { data: calc, error: calcError } = await supabase
      .rpc('calculate_agent_commission', {
        p_landlord_rent_minor: landlordRentMinor,
      })
      .single();

    if (calcError) throw calcError;

    const {
      markup_amount_minor,
      student_pays_minor,
      platform_commission_minor,
      referrer_commission_minor,
      platform_agent_commission_minor,
    } = calc as {
      markup_amount_minor: number;
      student_pays_minor: number;
      platform_commission_minor: number;
      referrer_commission_minor: number;
      platform_agent_commission_minor: number;
    };

    // ── Attribution: find the earliest approved submission for this unit ───────
    const { data: firstSubmission, error: submissionError } = await supabase
      .from('accommodation_submissions')
      .select('id, submitted_by, source_type, agent_id')
      .eq('matched_unit_id', unit_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (submissionError) throw submissionError;

    let referrer_type: string | null = null;
    let referrer_id: string | null = null;

    if (firstSubmission) {
      if (firstSubmission.source_type === 'agent' && firstSubmission.agent_id) {
        referrer_type = 'agent';
        referrer_id = firstSubmission.agent_id;
      } else {
        referrer_type = 'student';
        referrer_id = firstSubmission.submitted_by;
      }
    }

    // Reusing the viewing ID lets an admin retry referral creation without
    // creating a second completed transaction.
    let transaction;
    let existingTransaction = false;
    if (viewing_id) {
      const { data, error } = await supabase
        .from('accommodation_transactions')
        .select('*')
        .eq('viewing_id', viewing_id)
        .maybeSingle();
      if (error) throw error;
      transaction = data;
      existingTransaction = Boolean(data);
    }

    if (!transaction) {
      const { data, error: txError } = await supabase
        .from('accommodation_transactions')
        .insert({
          unit_id,
          property_id,
          student_id,
          viewing_id: viewing_id || null,
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: notes || null,

          // Commission fields (all in kobo)
          landlord_rent_amount: landlordRentMinor,
          markup_amount: markup_amount_minor,
          student_pays_amount: student_pays_minor,
          platform_commission: platform_commission_minor,
          referrer_commission: referrer_commission_minor,
          platform_agent_commission: platform_agent_commission_minor,
          referrer_type,
          referrer_id,
          platform_agent_id: user.id, // The admin confirming the deal is the platform agent
        })
        .select()
        .single();

      if (txError) throw txError;
      transaction = data;
    }
    const transactionLandlordRentMinor = Number(
      transaction.landlord_rent_amount ?? landlordRentMinor,
    );
    const transactionMarkupMinor = Number(
      transaction.markup_amount ?? markup_amount_minor,
    );
    const transactionStudentPaysMinor = Number(
      transaction.student_pays_amount ?? student_pays_minor,
    );
    const referralCommissionMinor = existingTransaction
      ? Number(transaction.referrer_commission ?? referrer_commission_minor)
      : referrer_commission_minor;

    // ── Mark unit as rented ───────────────────────────────────────────────────
    await supabase
      .from('accommodation_units')
      .update({
        availability_status: 'rented',
        updated_at: new Date().toISOString(),
      })
      .eq('id', unit_id);

    // ── Ensure agent commission record exists for agent-sourced listings ──────
    let agentCommission: {
      created: boolean;
      exists: boolean;
      issue: string | null;
      error?: string;
    } = {
      created: false,
      exists: false,
      issue: referrer_type === 'agent' ? 'not_processed' : null,
    };

    if (referrer_type === 'agent' && referrer_id) {
      const { data: agentRecord, error: agentLookupError } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', referrer_id)
        .maybeSingle();

      if (agentLookupError) throw agentLookupError;

      if (!agentRecord) {
        agentCommission.issue = 'agent_record_not_found';
      } else {
        const { data: existingCommission, error: existingCommissionError } = await supabase
          .from('agent_commission_records')
          .select('id')
          .eq('transaction_id', transaction.id)
          .maybeSingle();

        if (existingCommissionError) throw existingCommissionError;

        if (existingCommission) {
          agentCommission = {
            created: false,
            exists: true,
            issue: null,
          };
        } else {
          const { data: commission, error: commissionError } = await supabase
            .from('agent_commission_records')
            .insert({
              transaction_id: transaction.id,
              unit_id,
              agent_id: agentRecord.id,
              landlord_rent_minor: transactionLandlordRentMinor,
              markup_rate_bps: 2000,
              markup_amount_minor: transactionMarkupMinor,
              student_pays_minor: transactionStudentPaysMinor,
              referrer_rate_bps: 500,
              agent_commission_minor: referralCommissionMinor,
              status: 'pending_confirmation',
            })
            .select('id')
            .single();

          if (commissionError) {
            console.error('Agent commission creation error:', commissionError);
            agentCommission = {
              created: false,
              exists: false,
              issue: 'creation_failed',
              error: [
                commissionError.message,
                commissionError.code ? `code ${commissionError.code}` : null,
                commissionError.details,
                commissionError.hint,
              ].filter(Boolean).join(' — '),
            };
          } else {
            agentCommission = {
              created: true,
              exists: false,
              issue: null,
            };

            const { error: auditError } = await supabase.from('agent_audit_events').insert({
              agent_id: agentRecord.id,
              actor_user_id: user.id,
              event_type: 'commission_created',
              entity_type: 'commission',
              entity_id: transaction.id,
              metadata: {
                unit_id,
                landlord_rent_minor: transactionLandlordRentMinor,
                agent_commission_minor: referralCommissionMinor,
                transaction_id: transaction.id,
                commission_id: commission.id,
              },
            });

            if (auditError) {
              console.error('Agent commission audit event error:', auditError);
            }
          }
        }

        if (agentCommission.created || agentCommission.exists) {
          const { count, error: countError } = await supabase
            .from('agent_commission_records')
            .select('id', { count: 'exact', head: true })
            .eq('agent_id', agentRecord.id);

          if (countError) {
            console.error('Agent rental count refresh error:', countError);
          } else {
            const { error: updateCountError } = await supabase
              .from('agents')
              .update({ total_transactions: count ?? 0 })
              .eq('id', agentRecord.id);

            if (updateCountError) {
              console.error('Agent rental count update error:', updateCountError);
            }
          }
        }
      }
    }

    // ── Create student referral record (if student-sourced) ───────────────────
    let referral: {
      created: boolean;
      issue: string | null;
      error?: string;
    } = {
      created: false,
      issue: firstSubmission ? 'agent_sourced' : 'no_matching_submission',
    };

    if (firstSubmission && referrer_type === 'student') {
      if (!firstSubmission.submitted_by) {
        referral.issue = 'missing_submitter';
      } else {
        const { data: existingReferral, error: existingReferralError } = await supabase
          .from('accommodation_referrals')
          .select('id')
          .eq('submission_id', firstSubmission.id)
          .maybeSingle();

        if (existingReferralError) throw existingReferralError;

        if (existingReferral) {
          referral = { created: false, issue: null };
        } else {
          const { error: referralError } = await supabase.from('accommodation_referrals').insert({
            referrer_id: firstSubmission.submitted_by,
            submission_id: firstSubmission.id,
            unit_id,
            transaction_id: transaction.id,
            eligibility_status: 'eligible',
            reward_amount: Math.round(referralCommissionMinor / 100), // Back to Naira
          });
          if (referralError) {
            console.error('Accommodation referral creation error:', referralError);
            const errorMessage = [
              referralError.message,
              referralError.code ? `code ${referralError.code}` : null,
              referralError.details,
              referralError.hint,
            ].filter(Boolean).join(' — ');
            referral = {
              created: false,
              issue: 'creation_failed',
              error: errorMessage,
            };
          } else {
            referral = { created: true, issue: null };
          }
        }
      }
    }

    if (!referral.created && referral.issue) {
      console.warn('Accommodation referral was not created:', {
        issue: referral.issue,
        unit_id,
        transaction_id: transaction.id,
        submission_id: firstSubmission?.id || null,
      });
    }
    if (agentCommission.issue) {
      console.warn('Agent commission was not created:', {
        issue: agentCommission.issue,
        unit_id,
        transaction_id: transaction.id,
        agent_user_id: referrer_id,
        error: agentCommission.error,
      });
    }

    // ── Notifications ─────────────────────────────────────────────────────────
    const { sendNotification } = await import('@/utils/lib/services/notification-service');
    const formatNaira = (minor: number) =>
      new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
        .format(minor / 100);

    // Notify renting student
    if (!existingTransaction) {
      sendNotification({
        userId: student_id,
        type: 'accommodation',
        title: '🎉 Rental confirmed!',
        body: 'Your accommodation rental has been confirmed by Campus&Me.',
        data: { transaction_id: transaction.id },
      }).catch(console.error);
    }

    // Notify referrer
    if (
      referrer_id &&
      referrer_id !== student_id &&
      (!existingTransaction || agentCommission.created)
    ) {
      if (referrer_type === 'agent') {
        sendNotification({
          userId: referrer_id,
          type: 'accommodation',
          title: '💰 Commission pending!',
          body: `A rental was completed on your listing. Commission: ${formatNaira(referrer_commission_minor)}. Check your commission records.`,
          data: {
            transaction_id: transaction.id,
            deeplink: '/agent/commissions',
          },
        }).catch(console.error);
      } else {
        sendNotification({
          userId: referrer_id,
          type: 'accommodation',
          title: '🏆 Referral reward eligible!',
          body: `Your submission led to a rental! Referral reward: ${formatNaira(referrer_commission_minor)}.`,
          data: { transaction_id: transaction.id },
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      transaction,
      referral,
      agent_commission: agentCommission,
      commission_summary: {
        landlord_rent: formatNaira(landlordRentMinor),
        markup_20_percent: formatNaira(markup_amount_minor),
        student_pays: formatNaira(student_pays_minor),
        platform_keeps: formatNaira(platform_commission_minor),
        referrer_commission: formatNaira(referrer_commission_minor),
        platform_agent_commission: formatNaira(platform_agent_commission_minor),
        referrer_type,
      },
    });
  } catch (error: unknown) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' },
      { status: 500 },
    );
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'completed';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const { data: transactions, error } = await supabase
      .from('accommodation_transactions')
      .select(`
        id, status, completed_at, created_at,
        landlord_rent_amount, markup_amount, student_pays_amount,
        platform_commission, referrer_commission, platform_agent_commission,
        referrer_type, referrer_id,
        unit:accommodation_units (id, unit_number, room_type,
          property:accommodation_properties (name, area)
        )
      `)
      .eq('status', status)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ transactions: transactions || [] });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 },
    );
  }
}