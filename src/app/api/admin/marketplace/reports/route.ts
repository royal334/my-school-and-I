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
        id, reporter_id, reason, details, status, created_at,
        listing:marketplace_listings (
          id, title, seller_type, seller_id
        )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: reports, error } = await query;
    if (error) throw error;

    const profileIds = [
      ...new Set(
        (reports || [])
          .flatMap((report: any) => [report.reporter_id, report.listing?.seller_id])
          .filter(Boolean),
      ),
    ];
    const profilesById: Record<string, any> = {};
    if (profileIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', profileIds);
      if (profilesError) throw profilesError;
      (profiles || []).forEach((profile: any) => {
        profilesById[profile.id] = profile;
      });
    }

    const result = (reports || []).map((report: any) => {
      const { reporter_id, ...reportData } = report;
      return {
        ...reportData,
        reporter: profilesById[reporter_id] || null,
        listing: report.listing
          ? {
              ...report.listing,
              seller_name: profilesById[report.listing.seller_id]?.full_name || 'Unknown',
            }
          : null,
      };
    });

    return NextResponse.json({ reports: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}