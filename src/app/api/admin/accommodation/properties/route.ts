// app/api/admin/accommodation/properties/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type PropertyWithUnits = {
  [key: string]: unknown;
  units?: Array<{ [key: string]: unknown; id: string }> | null;
};

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['super_admin', 'admin'])
    .single();
  return !!data;
}

// GET /api/admin/accommodation/properties
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: properties, error } = await supabase
      .from('accommodation_properties')
      .select(`
        *,
        units:accommodation_units (
          id, unit_number, room_type, price, availability_status, last_verified_at, verification_due_at, created_at
        )
      `)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const propertyRows = (properties || []) as PropertyWithUnits[];
    const unitIds = propertyRows.flatMap(property =>
      (property.units || []).map(unit => unit.id),
    );
    const submissionCreatedAtByUnitId = new Map<string, string>();
    if (unitIds.length > 0) {
      const { data: linkedSubmissions, error: submissionsError } = await supabase
        .from('accommodation_submissions')
        .select('matched_unit_id, created_at')
        .in('matched_unit_id', unitIds)
        .order('created_at', { ascending: true });

      if (submissionsError) throw submissionsError;
      for (const submission of linkedSubmissions || []) {
        if (submission.matched_unit_id && !submissionCreatedAtByUnitId.has(submission.matched_unit_id)) {
          submissionCreatedAtByUnitId.set(submission.matched_unit_id, submission.created_at);
        }
      }
    }

    const propertiesWithSubmissionDates = propertyRows.map(property => ({
      ...property,
      units: (property.units || []).map(unit => ({
        ...unit,
        submission_created_at: submissionCreatedAtByUnitId.get(unit.id) || null,
      })),
    }));

    return NextResponse.json({ properties: propertiesWithSubmissionDates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/accommodation/properties - Create property + unit
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { property, unit } = body;

    // Create property
    const { data: newProperty, error: propError } = await supabase
      .from('accommodation_properties')
      .insert({ ...property, created_by: user.id })
      .select()
      .single();

    if (propError) throw propError;

    // Create unit if provided
    let newUnit = null;
    if (unit) {
      const verificationDue = new Date();
      verificationDue.setDate(verificationDue.getDate() + 7);

      const { data, error: unitError } = await supabase
        .from('accommodation_units')
        .insert({
          ...unit,
          property_id: newProperty.id,
          created_by: user.id,
          availability_status: 'unavailable', // Starts unavailable until verified
        })
        .select()
        .single();

      if (unitError) throw unitError;
      newUnit = data;
    }

    return NextResponse.json({
      success: true,
      property: newProperty,
      unit: newUnit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}