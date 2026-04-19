import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(await cookies());
    const now = new Date().toISOString();

    // Find expired subscriptions
    const { data: expiredVendors, error: fetchError } = await supabase
      .from('vendors')
      .select('id, owner_id, subscription_tier, subscription_expires_at')
      .not('subscription_tier', 'eq', 'basic')
      .lt('subscription_expires_at', now);

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch expired subscriptions' }, { status: 500 });
    }

    if (!expiredVendors || expiredVendors.length === 0) {
      return NextResponse.json({ message: 'No expired subscriptions' });
    }

    let successCount = 0;
    const errors = [];

    // Downgrade each expired vendor
    for (const vendor of expiredVendors) {
      try {
        // 1. Update vendor table
        const { error: updateError } = await supabase
          .from('vendors')
          .update({
            subscription_tier: 'basic',
            subscription_expires_at: null,
            subscription_starts_at: null,
            subscription_auto_renew: false,
            updated_at: now,
          })
          .eq('id', vendor.id);

        if (updateError) {
          console.error(`Error downgrading vendor ${vendor.id}:`, updateError);
          errors.push({ vendor_id: vendor.id, stage: 'update', error: updateError.message });
          continue; // Skip history insert if update fails
        }

        // 2. Log expiration in history
        const { error: historyError } = await supabase
          .from('vendor_subscription_history')
          .insert({
            vendor_id: vendor.id,
            tier: vendor.subscription_tier,
            amount: 0,
            status: 'expired',
          });

        if (historyError) {
          console.error(`Error logging history for vendor ${vendor.id}:`, historyError);
          errors.push({ vendor_id: vendor.id, stage: 'history', error: historyError.message });
          // Note: The vendor is already downgraded in the database.
          // In a system without transactions, we log this inconsistency.
          continue;
        }

        // 3. Optional: Notify vendor (commented out as in original)
        /*
        await supabase.from('notifications').insert({
          user_id: vendor.owner_id,
          type: 'subscription_expired',
          title: 'Subscription expired',
          message: `Your ${vendor.subscription_tier} subscription has expired. You are now on the Basic plan.`,
          metadata: { vendor_id: vendor.id },
        });
        */

        successCount++;
      } catch (innerError: any) {
        console.error(`Unexpected error processing vendor ${vendor.id}:`, innerError);
        errors.push({ vendor_id: vendor.id, stage: 'unexpected', error: innerError.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed_count: expiredVendors.length,
      success_count: successCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Cron job exception:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
