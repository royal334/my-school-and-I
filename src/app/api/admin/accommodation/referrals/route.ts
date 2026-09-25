// app/api/admin/accommodation/referrals/route.ts
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

// GET /api/admin/accommodation/referrals
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
      .from('accommodation_referrals')
      .select(`
        *,
        referrer:profiles!accommodation_referrals_referrer_id_fkey (
          id, full_name
        ),
        unit:accommodation_units (
          id, unit_number, room_type,
          property:accommodation_properties (id, name, area)
        ),
        transaction:accommodation_transactions (
          id, rent_amount, completed_at
        )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('eligibility_status', status);

    const { data: referrals, error } = await query;
    if (error) throw error;

    return NextResponse.json({ referrals: referrals || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}