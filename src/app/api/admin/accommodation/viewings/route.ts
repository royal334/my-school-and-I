// app/api/admin/accommodation/viewings/route.ts
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

// GET /api/admin/accommodation/viewings
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
      .from('accommodation_viewings')
      .select(`
        *,
        unit:accommodation_units (
          id, unit_number, room_type, price,
          property:accommodation_properties (id, name, area, landlord_phone, caretaker_phone)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data: viewings, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ viewings: viewings || [], pagination: { total: count || 0, limit, offset } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}