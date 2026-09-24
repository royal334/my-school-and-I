// app/api/accommodation/submissions/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/accommodation/submissions - Student submits a new lead
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      property_name,
      area,
      street,
      landmark,
      unit_number,
      room_type,
      expected_price,
      available_from,
      additional_charges_note,
      landlord_name,
      landlord_phone,
      submitter_relationship,
      has_water,
      has_electricity,
      has_security,
      facilities_notes,
      other_notes,
    } = body;

    // Basic validation
    if (!property_name || !area || !room_type) {
      return NextResponse.json(
        { error: 'Property name, area, and room type are required' },
        { status: 400 }
      );
    }

    // Create the submission
    const { data: submission, error } = await supabase
      .from('accommodation_submissions')
      .insert({
        submitted_by: user.id,
        property_name,
        area,
        street: street || null,
        landmark: landmark || null,
        unit_number: unit_number || null,
        room_type,
        expected_price: expected_price || null,
        available_from: available_from || null,
        additional_charges_note: additional_charges_note || null,
        landlord_name: landlord_name || null,
        landlord_phone: landlord_phone || null,
        submitter_relationship: submitter_relationship || null,
        has_water: has_water ?? null,
        has_electricity: has_electricity ?? null,
        has_security: has_security ?? null,
        facilities_notes: facilities_notes || null,
        other_notes: other_notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Notify admin team
    const { data: admins } = await supabase
      .from('admin_roles')
      .select('user_id')
      .in('role', ['super_admin', 'admin']);

    if (admins && admins.length > 0) {
      const { sendBulkNotification } = await import('@/utils/lib/services/notification-service');
      sendBulkNotification({
        userIds: admins.map((a: any) => a.user_id),
        type: 'accommodation',
        title: 'New accommodation lead',
        body: `${property_name} in ${area} submitted for review`,
        data: {
          submission_id: submission.id,
          deeplink: `/dashboard/admin/accommodation/leads/${submission.id}`,
        },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      submission,
      message: 'Submission received. Our team will review it and contact you.',
    });
  } catch (error: any) {
    console.error('Create submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit' },
      { status: 500 }
    );
  }
}

// GET /api/accommodation/submissions - Student's own submissions
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: submissions, error } = await supabase
      .from('accommodation_submissions')
      .select(`
        id,
        property_name,
        area,
        room_type,
        expected_price,
        status,
        admin_notes,
        created_at,
        matched_unit_id
      `)
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Look up matched unit statuses (link only works when unit is 'available')
    const unitIds = Array.from(
      new Set((submissions || []).map(s => s.matched_unit_id).filter(Boolean))
    );
    let unitStatusById: Record<string, string> = {};
    if (unitIds.length > 0) {
      const { data: units } = await supabase
        .from('accommodation_units')
        .select('id, availability_status')
        .in('id', unitIds);
      unitStatusById = Object.fromEntries(
        (units || []).map(u => [u.id, u.availability_status])
      );
    }

    const result = (submissions || []).map(s => ({
      ...s,
      matched_unit_status: s.matched_unit_id
        ? unitStatusById[s.matched_unit_id] || null
        : null,
    }));

    return NextResponse.json({ submissions: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}