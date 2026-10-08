import { NextResponse } from "next/server";
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const nowDate = new Date();
    const now = nowDate.toISOString();

    // The daily cron sends one reminder on the calendar day seven days before
    // expiry, rather than sending a reminder every day during the final week.
    const reminderStart = new Date(nowDate);
    reminderStart.setUTCDate(reminderStart.getUTCDate() + 7);
    reminderStart.setUTCHours(0, 0, 0, 0);
    const reminderEnd = new Date(reminderStart);
    reminderEnd.setUTCDate(reminderEnd.getUTCDate() + 1);

    const { data: expiringVendors, error: reminderFetchError } = await supabase
      .from('vendors')
      .select('id, owner_id, business_name, subscription_tier, subscription_expires_at')
      .not('subscription_tier', 'eq', 'basic')
      .gte('subscription_expires_at', reminderStart.toISOString())
      .lt('subscription_expires_at', reminderEnd.toISOString());

    if (reminderFetchError) {
      console.error('Error fetching subscriptions due for a reminder:', reminderFetchError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions due for a reminder' },
        { status: 500 },
      );
    }

    const { sendNotification } = await import('@/utils/lib/services/notification-service');
    let reminderCount = 0;
    for (const vendor of expiringVendors || []) {
      const result = await sendNotification({
        userId: vendor.owner_id,
        type: 'vendor',
        title: 'Your vendor subscription expires in one week',
        body: `Your ${vendor.subscription_tier} plan for ${vendor.business_name} expires on ${new Date(vendor.subscription_expires_at).toLocaleDateString('en-NG')}. Renew it to keep your vendor features.`,
        data: {
          vendor_id: vendor.id,
          deeplink: `/dashboard/vendors/${vendor.id}/upgrade`,
          notification_key: `vendor_expiry_reminder:${vendor.id}:${vendor.subscription_expires_at}`,
        },
      });

      if (result.success) {
        reminderCount += 1;
      } else {
        console.warn(`Vendor expiry reminder was not delivered for vendor ${vendor.id}:`, result.error || result.message);
      }
    }

    // Find expired subscriptions
    const { data: expiredVendors, error: fetchError } = await supabase
      .from('vendors')
      .select('id, owner_id, business_name, subscription_tier, subscription_expires_at')
      .not('subscription_tier', 'eq', 'basic')
      .lt('subscription_expires_at', now);

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch expired subscriptions' }, { status: 500 });
    }

    if (!expiredVendors || expiredVendors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired subscriptions',
        reminders_sent: reminderCount,
        processed_count: 0,
        success_count: 0,
      });
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

        const notificationResult = await sendNotification({
          userId: vendor.owner_id,
          type: 'vendor',
          title: 'Your vendor subscription has expired',
          body: `Your ${vendor.subscription_tier} plan for ${vendor.business_name} has expired. Renew your subscription to restore your premium vendor features.`,
          data: {
            vendor_id: vendor.id,
            deeplink: `/dashboard/vendors/${vendor.id}/upgrade`,
            notification_key: `vendor_expired_renewal:${vendor.id}:${vendor.subscription_expires_at}`,
          },
        });

        if (!notificationResult.success) {
          console.warn(`Vendor expiry renewal notification was not delivered for vendor ${vendor.id}:`, notificationResult.error || notificationResult.message);
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

        successCount++;
      } catch (innerError: unknown) {
        console.error(`Unexpected error processing vendor ${vendor.id}:`, innerError);
        errors.push({
          vendor_id: vendor.id,
          stage: 'unexpected',
          error: innerError instanceof Error ? innerError.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      reminders_sent: reminderCount,
      processed_count: expiredVendors.length,
      success_count: successCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: unknown) {
    console.error('Cron job exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
