// app/api/vendors/subscription/cancel-renewal/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { vendor_id } = await request.json();

    // Check ownership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: vendor } = await supabase
      .from('vendors')
      .select('owner_id, subscription_tier, subscription_expires_at')
      .eq('id', vendor_id)
      .single();

     if(!vendor){
          return NextResponse.json({error: 'Forbidden'}, { status: 403 })
     }
     
    if (vendor.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can't cancel Basic (it's free)
    if (vendor.subscription_tier === 'basic') {
      return NextResponse.json(
        { error: 'Cannot cancel free tier' },
        { status: 400 }
      );
    }

    // Turn off auto-renewal
    const { error } = await supabase
      .from('vendors')
      .update({
        subscription_auto_renew: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendor_id);

    if (error) throw error;

    // Log in subscription history
    await supabase.from('vendor_subscription_history').insert({
      vendor_id,
      tier: vendor.subscription_tier,
      amount: 0,
      status: 'auto_renew_cancelled',
      cancellation_type: 'soft',
      cancelled_at: new Date().toISOString(),
    });

//     // Send notification
//     await supabase.from('notifications').insert({
//       user_id: user.id,
//       type: 'subscription_cancelled',
//       title: 'Auto-renewal cancelled',
//       message: `Your ${vendor.subscription_tier} subscription will end on ${new Date(
//         vendor.subscription_expires_at
//       ).toLocaleDateString()}`,
//       metadata: { vendor_id },
//     });

    return NextResponse.json({
      success: true,
      message: 'Auto-renewal cancelled',
      expires_at: vendor.subscription_expires_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}