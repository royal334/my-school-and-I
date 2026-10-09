// app/api/agent/properties/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withAccommodationMediaUrls } from '@/utils/lib/accommodation-media';

// Helper: verify user is an approved agent
async function getApprovedAgent(supabase: any, userId: string) {
  const { data } = await supabase
    .from('agents')
    .select('id, status, display_name, id_doc_path')
    .eq('user_id', userId)
    .single();

  if (!data || data.status !== 'approved') return null;
  return data;
}

// GET /api/agent/properties - Agent's own submissions
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await getApprovedAgent(supabase, user.id);
    if (!agent) {
      return NextResponse.json({ error: 'Approved agent account required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let query = supabase
      .from('accommodation_submissions')
      .select(`
        id, property_name, area, street, landmark,
        unit_number, room_type, expected_price, available_from,
        has_water, has_electricity, has_security,
        status, admin_notes, created_at, updated_at,
        matched_property_id, matched_unit_id
      `)
      .eq('agent_id', user.id)
      .eq('source_type', 'agent')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: submissions, error } = await query;
    if (error) throw error;

    // Attach media for each submission
    const submissionIds = (submissions || []).map((s: any) => s.id);
    let mediaBySubmission: Record<string, any> = {};

    if (submissionIds.length > 0) {
      const { data: media } = await supabase
        .from('accommodation_media')
        .select('submission_id, file_path, is_cover')
        .in('submission_id', submissionIds)
        .eq('is_cover', true);

      const mediaWithUrls = await withAccommodationMediaUrls(supabase, media || []);
      mediaWithUrls.forEach((m: any) => {
        mediaBySubmission[m.submission_id] = m;
      });
    }

    const result = (submissions || []).map((s: any) => ({
      ...s,
      cover_image: mediaBySubmission[s.id] || null,
    }));

    return NextResponse.json({ submissions: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agent/properties - Submit new property
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await getApprovedAgent(supabase, user.id);
    if (!agent) {
      return NextResponse.json({ error: 'Approved agent account required' }, { status: 403 });
    }

    if (!agent.id_doc_path) {
      return NextResponse.json(
        {
          error: 'verification_required',
          message: 'Complete identity verification before submitting properties.',
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      property_name, area, street, landmark,
      unit_number, room_type, expected_price,
      available_from, additional_charges_note,
      landlord_name, landlord_phone,
      has_water, has_electricity, has_security,
      facilities_notes, other_notes,
    } = body;

    if (!property_name || !area || !room_type) {
      return NextResponse.json(
        { error: 'property_name, area and room_type are required' },
        { status: 400 }
      );
    }

    // Check for duplicate submission (same property_name + area by this agent)
    const { data: duplicate } = await supabase
      .from('accommodation_submissions')
      .select('id, status')
      .eq('agent_id', user.id)
      .eq('source_type', 'agent')
      .ilike('property_name', property_name.trim())
      .ilike('area', area.trim())
      .not('status', 'in', '(rejected,archived)')
      .single();

    if (duplicate) {
      return NextResponse.json(
        {
          error: 'duplicate_submission',
          message: 'You have already submitted a property with this name in this area.',
          existing_id: duplicate.id,
        },
        { status: 400 }
      );
    }

    // Create submission
    const { data: submission, error } = await supabase
      .from('accommodation_submissions')
      .insert({
        submitted_by: user.id,
        agent_id: user.id,
        source_type: 'agent',
        property_name,
        area,
        street: street || null,
        landmark: landmark || null,
        unit_number: unit_number || null,
        room_type,
        expected_price: expected_price ? parseFloat(expected_price) : null,
        available_from: available_from || null,
        additional_charges_note: additional_charges_note || null,
        landlord_name: landlord_name || null,
        landlord_phone: landlord_phone || null,
        submitter_relationship: 'Agent — manages this property',
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

    // Log audit event
    await supabase.from('agent_audit_events').insert({
      agent_id: agent.id,
      actor_user_id: user.id,
      event_type: 'property_submitted',
      entity_type: 'property',
      entity_id: submission.id,
      metadata: {
        property_name,
        area,
        room_type,
      },
    });

    // Notify admin team
    const { data: admins } = await supabase
      .from('admin_roles')
      .select('user_id')
      .in('role', ['super_admin', 'admin']);

    if (admins && admins.length > 0) {
      const { sendBulkNotification } = await import(
        '@/utils/lib/services/notification-service'
      );
      sendBulkNotification({
        userIds: admins.map((a: any) => a.user_id),
        type: 'accommodation',
        title: 'New agent property submission',
        body: `${agent.display_name} submitted: ${property_name}, ${area}`,
        data: {
          submission_id: submission.id,
          deeplink: `/admin/accommodation/leads/${submission.id}`,
        },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      submission,
      message: 'Property submitted for review.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}