// app/api/admin/accommodation/units/[id]/route.ts
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

// GET /api/admin/accommodation/units/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params

    const { data: unit, error } = await supabase
      .from('accommodation_units')
      .select(`
        *,
        property:accommodation_properties (*),
        verifications:accommodation_verifications (
          id,
          verified_at,
          verification_result,
          verified_by,
          notes,
          location_confirmed,
          owner_confirmed,
          price_confirmed,
          availability_confirmed,
          photos_confirmed,
          facilities_confirmed
        )
      `)
      .eq('id', id)
      .order('verified_at', { ascending: false, referencedTable: 'accommodation_verifications' })
      .single();

    if (error || !unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    // Fetch verified media
    const { data: media } = await supabase
      .from('accommodation_media')
      .select('id, file_path, file_type, is_cover, display_order')
      .eq('unit_id', id)
      .eq('media_source', 'verified')
      .order('display_order', { ascending: true });

    return NextResponse.json({ unit: { ...unit, media: media || [] } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/accommodation/units/[id] - Update unit details
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = await params

    const { data: unit, error } = await supabase
      .from('accommodation_units')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, unit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}