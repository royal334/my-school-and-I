// app/api/admin/accommodation/referrals/[id]/route.ts
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

// PATCH /api/admin/accommodation/referrals/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      eligibility_status,
      payout_status,
      reward_amount,
      paid_at,
      admin_notes,
    } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (eligibility_status !== undefined) updates.eligibility_status = eligibility_status;
    if (payout_status !== undefined) updates.payout_status = payout_status;
    if (reward_amount !== undefined) updates.reward_amount = reward_amount;
    if (paid_at !== undefined) updates.paid_at = paid_at;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { id } = await params;

    const { data: referral, error } = await supabase
      .from('accommodation_referrals')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', referral.referrer_id)
      .maybeSingle();

    if (referrerError) throw referrerError;

    // Notify referrer when paid
    if (payout_status === 'paid' && reward_amount) {
      const { sendNotification } = await import(
        '@/utils/lib/services/notification-service'
      );

      const formatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(reward_amount);

      sendNotification({
        userId: referral.referrer_id,
        type: 'accommodation',
        title: '🎉 Referral reward paid!',
        body: `Your referral reward of ${formatted} has been paid. Thank you!`,
        data: { referral_id: referral.id },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      referral: { ...referral, referrer },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}