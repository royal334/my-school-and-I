// app/api/admin/marketplace/listings/route.ts
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

// GET /api/admin/marketplace/listings
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('marketplace_listings')
      .select(`
        id, title, price, category, seller_type, seller_id,
        status, is_boosted, is_urgent, views, saves_count, created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data: listings, error, count } = await query;
    if (error) throw error;

    // Get seller names
    const sellerIds = [...new Set((listings || []).map((l: any) => l.seller_id))];
    let profilesById: Record<string, any> = {};
    if (sellerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', sellerIds);
      (profiles || []).forEach((p: any) => { profilesById[p.id] = p; });
    }

    // Search filter
    let result = (listings || []).map((l: any) => ({
      ...l,
      seller_name: profilesById[l.seller_id]?.full_name || 'Unknown',
    }));

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((l: any) =>
        l.title.toLowerCase().includes(s) ||
        l.seller_name.toLowerCase().includes(s) ||
        l.category.toLowerCase().includes(s)
      );
    }

    return NextResponse.json({ listings: result, total: count || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}