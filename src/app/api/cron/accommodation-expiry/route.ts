// app/api/cron/accommodation-expiry/route.ts
/**
 * Cron job: Check for expired accommodation listings
 * Run daily via Vercel cron or external scheduler
 *
 * Add to vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/accommodation-expiry",
 *       "schedule": "0 6 * * *"
 *     }
 *   ]
 * }
 *
 * Add CRON_SECRET to .env.local:
 * CRON_SECRET=your_secret_here
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // 1. Find units where verification is overdue and still showing as available
    const { data: overdueUnits, error: fetchError } = await supabase
      .from('accommodation_units')
      .select('id, property_id, availability_status, verification_due_at')
      .eq('availability_status', 'available')
      .lt('verification_due_at', now);

    if (fetchError) throw fetchError;

    if (!overdueUnits || overdueUnits.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No overdue listings found',
        processed: 0,
      });
    }

    const overdueIds = overdueUnits.map(u => u.id);

    // 2. Mark overdue units as pending_reverification
    const { error: updateError } = await supabase
      .from('accommodation_units')
      .update({
        availability_status: 'pending_reverification',
        updated_at: now,
      })
      .in('id', overdueIds);

    if (updateError) throw updateError;

    // 3. Notify admin team
    const { data: admins } = await supabase
      .from('admin_roles')
      .select('user_id')
      .in('role', ['super_admin', 'admin']);

    if (admins && admins.length > 0) {
      const { sendBulkNotification } = await import(
        '@/utils/lib/services/notification-service'
      );

      sendBulkNotification({
        userIds: admins.map((a: any) => a.user_id),
        type: 'accommodation',
        title: '⏰ Listings need re-verification',
        body: `${overdueIds.length} listing${overdueIds.length > 1 ? 's' : ''} have expired and need re-verification.`,
        data: {
          count: overdueIds.length,
          deeplink: '/admin/accommodation',
        },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      processed: overdueIds.length,
      message: `Marked ${overdueIds.length} listing${overdueIds.length > 1 ? 's' : ''} as pending reverification`,
    });
  } catch (error: any) {
    console.error('Accommodation expiry cron error:', error);
    return NextResponse.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    );
  }
}