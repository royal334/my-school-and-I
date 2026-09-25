// app/api/admin/accommodation/verify/[unitId]/route.ts
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

// POST /api/admin/accommodation/verify/[unitId]
export async function POST(
  request: Request,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId } = await params;
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      property_id,
      verification_result, // 'approved' | 'rejected'
      location_confirmed,
      owner_confirmed,
      price_confirmed,
      availability_confirmed,
      photos_confirmed,
      facilities_confirmed,
      notes,
      // Unit updates after verification
      unit_updates, // { price, room_type, has_water, etc. }
      // Days until next verification (default 7)
      verification_days = 7,
    } = body;

    if (!property_id || !verification_result) {
      return NextResponse.json(
        { error: 'property_id and verification_result are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const nextVerification = new Date();
    nextVerification.setDate(nextVerification.getDate() + verification_days);

    // 1. Create verification record
    const { data: verification, error: verError } = await supabase
      .from('accommodation_verifications')
      .insert({
        property_id,
        unit_id: unitId,
        verified_by: user.id,
        verified_at: now.toISOString(),
        next_verification_due_at: nextVerification.toISOString(),
        location_confirmed: location_confirmed ?? false,
        owner_confirmed: owner_confirmed ?? false,
        price_confirmed: price_confirmed ?? false,
        availability_confirmed: availability_confirmed ?? false,
        photos_confirmed: photos_confirmed ?? false,
        facilities_confirmed: facilities_confirmed ?? false,
        verification_result,
        notes: notes || null,
      })
      .select()
      .single();

    if (verError) throw verError;

    // 2. Update unit status based on result
    const unitUpdate: Record<string, any> = {
      last_verified_at: now.toISOString(),
      verification_due_at: nextVerification.toISOString(),
      updated_at: now.toISOString(),
      ...(unit_updates || {}),
    };

    if (verification_result === 'approved') {
      unitUpdate.availability_status = 'available';
    } else {
      unitUpdate.availability_status = 'unavailable';
    }

    const { data: unit, error: unitError } = await supabase
      .from('accommodation_units')
      .update(unitUpdate)
      .eq('id', unitId)
      .select()
      .single();

    if (unitError) throw unitError;

    return NextResponse.json({
      success: true,
      verification,
      unit,
      message: verification_result === 'approved'
        ? 'Unit verified and listed as available'
        : 'Unit marked as unavailable',
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}