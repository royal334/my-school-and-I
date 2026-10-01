// app/api/admin/marketplace/reports/[id]/route.ts
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

// PATCH /api/admin/marketplace/reports/[id]
// Actions: remove_listing, dismiss, review
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, listing_id, admin_notes } = await request.json();

    if (action === 'remove_listing' && listing_id) {
      // Remove the listing
      await supabase
        .from('marketplace_listings')
        .update({ status: 'removed', updated_at: new Date().toISOString() })
        .eq('id', listing_id);

      // Mark all reports for this listing as actioned
      await supabase
        .from('marketplace_reports')
        .update({
          status: 'actioned',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: admin_notes || 'Listing removed by admin',
        })
        .eq('listing_id', listing_id);

      // Notify seller
      const { data: listing } = await supabase
        .from('marketplace_listings')
        .select('seller_id, title')
        .eq('id', listing_id)
        .single();

      if (listing) {
        const { sendNotification } = await import(
          '@/utils/lib/services/notification-service'
        );
        sendNotification({
          userId: listing.seller_id,
          type: 'platform',
          title: 'Listing removed',
          body: `Your listing "${listing.title}" was removed for violating Campus&Me guidelines.`,
          data: { listing_id },
        }).catch(console.error);
      }

      return NextResponse.json({ success: true, action: 'removed' });
    }

    if (action === 'dismiss') {
      await supabase
        .from('marketplace_reports')
        .update({
          status: 'dismissed',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: admin_notes || null,
        })
        .eq('id', id);

      return NextResponse.json({ success: true, action: 'dismissed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}