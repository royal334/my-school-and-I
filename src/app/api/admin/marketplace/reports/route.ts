// app/api/admin/marketplace/reports/route.ts
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

// GET /api/admin/marketplace/reports
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let query = supabase
      .from('marketplace_reports')
      .select(`
        id, reason, details, status, created_at,
        reporter:profiles!marketplace_reports_reporter_id_fkey (
          id, full_name
        ),
        listing:marketplace_listings (
          id, title, seller_type, seller_id
        )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: reports, error } = await query;
    if (error) throw error;

    // Enrich with seller names
    const sellerIds = [...new Set((reports || []).map((r: any) => r.listing?.seller_id).filter(Boolean))];
    let profilesById: Record<string, any> = {};
    if (sellerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', sellerIds);
      (profiles || []).forEach((p: any) => { profilesById[p.id] = p; });
    }

    const result = (reports || []).map((r: any) => ({
      ...r,
      listing: r.listing ? {
        ...r.listing,
        seller_name: profilesById[r.listing.seller_id]?.full_name || 'Unknown',
      } : null,
    }));

    return NextResponse.json({ reports: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}