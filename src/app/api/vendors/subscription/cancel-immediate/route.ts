import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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

   
       // Downgrade immediately
       const { error } = await supabase
         .from('vendors')
         .update({
           subscription_tier: 'basic',
           subscription_expires_at: null,
           subscription_auto_renew: false,
           cancelled_at: new Date().toISOString(),
           updated_at: new Date().toISOString(),
         })
         .eq('id', vendor_id);
   
       if (error) throw error;
   
       // Log cancellation
       await supabase.from('vendor_subscription_history').insert({
         vendor_id,
         tier: vendor.subscription_tier,
         amount: 0,
         status: 'cancelled',
         cancellation_type: 'hard',
         cancelled_at: new Date().toISOString(),
       });
   
       // Send notification
     //   await supabase.from('notifications').insert({
     //     user_id: user.id,
     //     type: 'subscription_cancelled',
     //     title: 'Subscription cancelled',
     //     message: 'Your subscription has been cancelled. You are now on the Basic plan.',
     //     metadata: { vendor_id },
     //   });
   
       return NextResponse.json({
         success: true,
         message: 'Subscription cancelled immediately',
         new_tier: 'basic',
       });
     } catch (error: any) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }
   }