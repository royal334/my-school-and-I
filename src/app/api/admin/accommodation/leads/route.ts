// app/api/admin/accommodation/leads/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Admin check helper
async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['super_admin', 'admin'])
    .single();
  return !!data;
}

// GET /api/admin/accommodation/leads - All submissions
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('accommodation_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data: leads, error, count } = await query;
    if (error) throw error;

    const ids = Array.from(
      new Set((leads || []).map((lead) => lead.submitted_by).filter(Boolean))
    );

    let profilesById = new Map<string, { id: string; full_name: string | null }>();
    if (ids.length > 0) {
      const { data: submitters } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ids);
      profilesById = new Map((submitters || []).map((p) => [p.id, p]));
    }

    const result = (leads || []).map((lead) => ({
      ...lead,
      submitter: lead.submitted_by ? profilesById.get(lead.submitted_by) || null : null,
    }));

    return NextResponse.json({ leads: result, pagination: { total: count || 0, limit, offset } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}