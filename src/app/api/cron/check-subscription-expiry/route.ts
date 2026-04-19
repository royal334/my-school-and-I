import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
     // Verify cron secret
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
   
     const supabase = createClient(await cookies());
     const now = new Date().toISOString();
   
     // Find expired subscriptions
     const { data: expiredVendors } = await supabase
       .from('vendors')
       .select('id, owner_id, subscription_tier, subscription_expires_at')
       .not('subscription_tier', 'eq', 'basic')
       .lt('subscription_expires_at', now);
   
     if (!expiredVendors || expiredVendors.length === 0) {
       return NextResponse.json({ message: 'No expired subscriptions' });
     }
   
     // Downgrade each expired vendor
     for (const vendor of expiredVendors) {
       await supabase
         .from('vendors')
         .update({
           subscription_tier: 'basic',
           subscription_expires_at: null,
           subscription_starts_at: null,
           subscription_auto_renew: false,
           updated_at: now,
         })
         .eq('id', vendor.id);
   
       // Log expiration
       await supabase.from('vendor_subscription_history').insert({
         vendor_id: vendor.id,
         tier: vendor.subscription_tier,
         amount: 0,
         status: 'expired',
       });
   
     //   // Notify vendor
     //   await supabase.from('notifications').insert({
     //     user_id: vendor.owner_id,
     //     type: 'subscription_expired',
     //     title: 'Subscription expired',
     //     message: `Your ${vendor.subscription_tier} subscription has expired. You are now on the Basic plan.`,
     //     metadata: { vendor_id: vendor.id },
     //   });
     }
   
     return NextResponse.json({
       success: true,
       expired_count: expiredVendors.length,
     });
   }