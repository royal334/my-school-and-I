// app/api/admin/accommodation/referrals/route.ts
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

// GET /api/admin/accommodation/referrals
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let query = supabase
      .from('accommodation_referrals')
      .select(`
        *,
        unit:accommodation_units (
          id, unit_number, room_type,
          property:accommodation_properties (id, name, area)
        ),
        transaction:accommodation_transactions (
          id, rent_amount, completed_at
        )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('eligibility_status', status);

    // Summary tiles must describe every referral, not just the filtered page,
    // so the aggregates are read from a second, join-free query.
    const [filteredResult, statsResult] = await Promise.all([
      query,
      supabase
        .from('accommodation_referrals')
        .select('eligibility_status, payout_status, reward_amount'),
    ]);

    if (filteredResult.error) throw filteredResult.error;
    if (statsResult.error) throw statsResult.error;

    const referrals = filteredResult.data || [];
    const allRows = statsResult.data || [];

    const stats = {
      awaiting_payout: allRows.filter(
        (r: { eligibility_status: string; payout_status: string }) =>
          r.eligibility_status === 'eligible' && r.payout_status !== 'paid',
      ).length,
      processing: allRows.filter(
        (r: { payout_status: string }) => r.payout_status === 'processing',
      ).length,
      paid_count: allRows.filter((r: { payout_status: string }) => r.payout_status === 'paid')
        .length,
      total_paid: allRows.reduce(
        (sum: number, r: { payout_status: string; reward_amount: number | null }) =>
          r.payout_status === 'paid' ? sum + (r.reward_amount || 0) : sum,
        0,
      ),
    };

    const referrerIds = [
      ...new Set(referrals.map((referral) => referral.referrer_id).filter(Boolean)),
    ];
    const [profileResult, payoutDetailsResult] = referrerIds.length
      ? await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', referrerIds),
          supabase
            .from('accommodation_payout_details')
            .select('user_id, bank_name, account_name, account_number')
            .in('user_id', referrerIds),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ];

    if (profileResult.error) throw profileResult.error;
    if (payoutDetailsResult.error) throw payoutDetailsResult.error;

    const referrersByUserId = Object.fromEntries(
      (profileResult.data || []).map((profile) => [profile.id, profile]),
    );

    const payoutDetailsByUserId = Object.fromEntries(
      (payoutDetailsResult.data || []).map((details) => [details.user_id, details]),
    );

    return NextResponse.json({
      referrals: referrals.map((referral) => ({
        ...referral,
        referrer: referrersByUserId[referral.referrer_id] || null,
        payout_details: payoutDetailsByUserId[referral.referrer_id] || null,
      })),
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}