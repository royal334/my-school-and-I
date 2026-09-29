// app/api/admin/marketplace/listings/[id]/route.ts
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

// GET /api/admin/marketplace/listings/[id]
export async function GET(
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

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .select(`
        *,
        images:marketplace_listing_images (
          id, file_path, is_cover, display_order
        ),
        reports:marketplace_reports (
          id, reason, status, created_at,
          reporter:profiles!marketplace_reports_reporter_id_fkey (full_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', listing.seller_id)
      .single();

    return NextResponse.json({
      listing: {
        ...listing,
        seller_name: sellerProfile?.full_name || 'Unknown',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/marketplace/listings/[id]
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

    const body = await request.json();
    const { status, notify_seller, notification_message } = body;

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('seller_id, title')
      .single();

    if (error) throw error;

    // Optional seller notification
    if (notify_seller && listing && notification_message) {
      const { sendNotification } = await import(
        '@/utils/lib/services/notification-service'
      );
      sendNotification({
        userId: listing.seller_id,
        type: 'platform',
        title: 'Listing update',
        body: notification_message,
        data: { listing_id: id },
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}