// app/api/admin/accommodation/commissions/route.ts
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

// GET /api/admin/accommodation/commissions
// List all agent commission records with agent and unit info
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

    let query = supabase
      .from('agent_commission_records')
      .select(`
        id, status, created_at, confirmed_at, payment_recorded_at,
        landlord_rent_minor, markup_amount_minor, student_pays_minor,
        referrer_rate_bps, agent_commission_minor,
        payment_reference, payment_notes,
        agent:agents (
          id, display_name, phone_number, operating_area
        ),
        unit:accommodation_units (
          id, unit_number, room_type,
          property:accommodation_properties (name, area)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data: commissions, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      commissions: commissions || [],
      total: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}