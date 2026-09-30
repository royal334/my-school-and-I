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
          id, reporter_id, reason, status, created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error || !listing) {
      console.log('Listing not found or error:', error);
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const profileIds = [
      ...new Set([
        listing.seller_id,
        ...(listing.reports || []).map((report: any) => report.reporter_id),
      ].filter(Boolean)),
    ];
    const { data: profiles, error: profilesError } = profileIds.length
      ? await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', profileIds)
      : { data: [], error: null };
    if (profilesError) throw profilesError;

    const profilesById: Record<string, any> = {};
    (profiles || []).forEach((profile: any) => {
      profilesById[profile.id] = profile;
    });

    return NextResponse.json({
      listing: {
        ...listing,
        seller_name: profilesById[listing.seller_id]?.full_name || 'Unknown',
        reports: (listing.reports || []).map((report: any) => {
          const { reporter_id, ...reportData } = report;
          return {
            ...reportData,
            reporter: profilesById[reporter_id] || null,
          };
        }),
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