// app/api/admin/accommodation/leads/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withAccommodationMediaUrls } from '@/utils/lib/accommodation-media';

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['super_admin', 'admin'])
    .single();
  return !!data;
}

// GET /api/admin/accommodation/leads/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: lead, error } = await supabase
      .from('accommodation_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Fetch submitter profile separately (FK joins are unreliable client-side)
    let submitter = null;
    if (lead.submitted_by) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', lead.submitted_by)
        .maybeSingle();
      submitter = profile;
    }

    // Fetch matched property and unit separately (FK embeds are unreliable)
    let matched_property = null;
    if (lead.matched_property_id) {
      const { data: property } = await supabase
        .from('accommodation_properties')
        .select('id, name, area')
        .eq('id', lead.matched_property_id)
        .maybeSingle();
      matched_property = property;
    }

    let matched_unit = null;
    if (lead.matched_unit_id) {
      const { data: unit } = await supabase
        .from('accommodation_units')
        .select('id, unit_number, room_type')
        .eq('id', lead.matched_unit_id)
        .maybeSingle();
      matched_unit = unit;
    }

    // Fetch media attached to this submission
    const { data: media } = await supabase
      .from('accommodation_media')
      .select('*')
      .eq('submission_id', id);

    const mediaWithUrls = await withAccommodationMediaUrls(supabase, media || []);

    return NextResponse.json({
      lead: { ...lead, submitter, matched_property, matched_unit, media: mediaWithUrls },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/accommodation/leads/[id]
// Actions: update_status, mark_duplicate, link_property
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, status, admin_notes, matched_property_id, matched_unit_id, duplicate_of } = body;

    const updates: Record<string, any> = {
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (action === 'update_status') {
      updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
    }

    if (action === 'mark_duplicate') {
      updates.status = 'duplicate';
      updates.is_duplicate = true;
      updates.duplicate_of = duplicate_of || null;
      if (admin_notes) updates.admin_notes = admin_notes;
    }

    if (action === 'link_property') {
      if (matched_property_id) updates.matched_property_id = matched_property_id;
      if (matched_unit_id) updates.matched_unit_id = matched_unit_id;
      updates.status = 'approved';
    }

    const { data: lead, error } = await supabase
      .from('accommodation_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (action === 'link_property' && matched_unit_id) {
      const { error: mediaError } = await supabase
        .from('accommodation_media')
        .update({
          unit_id: matched_unit_id,
          media_source: 'verified',
        })
        .eq('submission_id', id);

      if (mediaError) throw mediaError;
    }

    // Notify the student who submitted
    const { sendNotification } = await import('@/utils/lib/services/notification-service');
    if (['approved', 'rejected', 'duplicate'].includes(updates.status)) {
      const messages: Record<string, { title: string; body: string }> = {
        approved: {
          title: 'Your submission was approved!',
          body: `${lead.property_name} has been verified and listed on CampusHub.`,
        },
        rejected: {
          title: 'Submission update',
          body: `Your submission for ${lead.property_name} could not be verified.`,
        },
        duplicate: {
          title: 'Submission update',
          body: `${lead.property_name} was already reported by another student.`,
        },
      };

      const msg = messages[updates.status];
      if (msg) {
        sendNotification({
          userId: lead.submitted_by,
          type: 'accommodation',
          title: msg.title,
          body: msg.body,
          data: { submission_id: lead.id },
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}