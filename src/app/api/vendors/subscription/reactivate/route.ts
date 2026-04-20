import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
   
       if (new Date(vendor.subscription_expires_at) < new Date()) {
         return NextResponse.json(
           { error: 'Subscription has already expired' },
           { status: 400 }
         );
       }
   
       // Turn auto-renewal back on
       const { error } = await supabase
         .from('vendors')
         .update({
           subscription_auto_renew: true,
           cancelled_at: null,
           updated_at: new Date().toISOString(),
         })
         .eq('id', vendor_id);
   
       if (error) throw error;
   
       // Log reactivation
       await supabase.from('vendor_subscription_history').insert({
         vendor_id,
         tier: vendor.subscription_tier,
         amount: 0,
         status: 'reactivated',
       });
   
     //   // Send notification
     //   await supabase.from('notifications').insert({
     //     user_id: user.id,
     //     type: 'subscription_reactivated',
     //     title: 'Subscription reactivated',
     //     message: `Your ${vendor.subscription_tier} subscription will auto-renew on ${new Date(
     //       vendor.subscription_expires_at
     //     ).toLocaleDateString()}`,
     //     metadata: { vendor_id },
     //   });
   
       return NextResponse.json({
         success: true,
         message: 'Auto-renewal reactivated',
         expires_at: vendor.subscription_expires_at,
       });
     } catch (error: any) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }
   }