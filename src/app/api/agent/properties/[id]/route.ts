// app/api/agent/properties/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withAccommodationMediaUrls } from '@/utils/lib/accommodation-media';

async function getApprovedAgent(supabase: any, userId: string) {
  const { data } = await supabase
    .from('agents')
    .select('id, status')
    .eq('user_id', userId)
    .single();
  if (!data || data.status !== 'approved') return null;
  return data;
}

// GET /api/agent/properties/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: submission, error } = await supabase
      .from('accommodation_submissions')
      .select('*')
      .eq('id', (await params).id)
      .eq('agent_id', user.id)
      .eq('source_type', 'agent')
      .single();

    if (error || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Fetch media
    const { data: media } = await supabase
      .from('accommodation_media')
      .select('id, file_path, file_name, file_type, is_cover, display_order')
      .eq('submission_id', (await params).id);

    const mediaWithUrls = await withAccommodationMediaUrls(supabase, media || []);

    return NextResponse.json({
      submission: { ...submission, media: mediaWithUrls },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/agent/properties/[id]
// Only allowed when status is 'draft' or 'correction_required'
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership + editable status
    const { data: existing } = await supabase
      .from('accommodation_submissions')
      .select('id, status, agent_id, source_type')
      .eq('id', (await params).id)
      .single();

    if (!existing || existing.agent_id !== user.id || existing.source_type !== 'agent') {
      return NextResponse.json({ error: 'Not found or not authorized' }, { status: 403 });
    }

    if (!['draft', 'correction_required'].includes(existing.status)) {
      return NextResponse.json(
        { error: `Cannot edit a submission with status: ${existing.status}` },
        { status: 400 }
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

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (property_name !== undefined) updates.property_name = property_name;
    if (area !== undefined) updates.area = area;
    if (street !== undefined) updates.street = street;
    if (landmark !== undefined) updates.landmark = landmark;
    if (unit_number !== undefined) updates.unit_number = unit_number;
    if (room_type !== undefined) updates.room_type = room_type;
    if (expected_price !== undefined) updates.expected_price = expected_price ? parseFloat(expected_price) : null;
    if (available_from !== undefined) updates.available_from = available_from;
    if (additional_charges_note !== undefined) updates.additional_charges_note = additional_charges_note;
    if (landlord_name !== undefined) updates.landlord_name = landlord_name;
    if (landlord_phone !== undefined) updates.landlord_phone = landlord_phone;
    if (has_water !== undefined) updates.has_water = has_water;
    if (has_electricity !== undefined) updates.has_electricity = has_electricity;
    if (has_security !== undefined) updates.has_security = has_security;
    if (facilities_notes !== undefined) updates.facilities_notes = facilities_notes;
    if (other_notes !== undefined) updates.other_notes = other_notes;

    // If was correction_required, move back to pending on save
    if (existing.status === 'correction_required') {
      updates.status = 'pending';
      updates.admin_notes = null; // Clear correction note
    }

    const { data: submission, error } = await supabase
      .from('accommodation_submissions')
      .update(updates)
      .eq('id', (await params).id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}