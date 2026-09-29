// app/api/marketplace/reports/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const VALID_REASONS = [
  'scam', 'fake_product', 'prohibited',
  'misleading', 'inappropriate', 'other',
];

// POST /api/marketplace/reports
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listing_id, reason, details } = await request.json();

    if (!listing_id || !reason) {
      return NextResponse.json(
        { error: 'listing_id and reason are required' },
        { status: 400 }
      );
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    const { error } = await supabase
      .from('marketplace_reports')
      .insert({
        listing_id,
        reporter_id: user.id,
        reason,
        details: details || null,
      });

    // Ignore duplicate (already reported)
    if (error && error.code !== '23505') throw error;

    // Notify admin if this listing now has 3+ reports
    const { count } = await supabase
      .from('marketplace_reports')
      .select('id', { count: 'exact' })
      .eq('listing_id', listing_id)
      .eq('status', 'pending');

    if ((count || 0) >= 3) {
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
          type: 'platform',
          title: '🚩 Listing flagged',
          body: `A marketplace listing has received ${count} reports and needs review.`,
          data: { listing_id, deeplink: `/dashboard/admin/marketplace/listings/${listing_id}` },
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}