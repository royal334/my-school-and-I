// app/api/admin/marketplace/stats/route.ts
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

// GET /api/admin/marketplace/stats
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      { count: totalActive },
      { count: totalSold },
      { count: totalBoosted },
      { count: pendingReports },
      { count: totalToday },
    ] = await Promise.all([
      supabase.from('marketplace_listings').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('marketplace_listings').select('id', { count: 'exact' }).eq('status', 'sold'),
      supabase.from('marketplace_listings').select('id', { count: 'exact' }).eq('is_boosted', true).eq('status', 'active'),
      supabase.from('marketplace_reports').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('marketplace_listings').select('id', { count: 'exact' }).gte('created_at', today.toISOString()),
    ]);

    return NextResponse.json({
      stats: {
        total_active: totalActive || 0,
        total_sold: totalSold || 0,
        total_boosted: totalBoosted || 0,
        pending_reports: pendingReports || 0,
        total_listings_today: totalToday || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}