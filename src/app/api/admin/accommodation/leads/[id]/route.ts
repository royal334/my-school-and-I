// app/api/admin/accommodation/leads/[id]/route.ts
// REPLACES the existing admin-accommodation-lead-detail-route.ts
// Added: source_type awareness, correction_required action for agents,
// agent attribution display, audit logging for agent submissions

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
      .select(`
        *,
        submitter:profiles!accommodation_submissions_submitted_by_fkey (
          id, full_name
        ),
        matched_property:accommodation_properties (id, name, area),
        matched_unit:accommodation_units (id, unit_number, room_type)
      `)
      .eq('id', id)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Fetch media attached to this submission
    const { data: media } = await supabase
      .from('accommodation_media')
      .select('*')
      .eq('submission_id', id);

    // If agent submission, fetch agent profile
    let agentProfile = null;
    if (lead.source_type === 'agent' && lead.agent_id) {
      const { data: agent } = await supabase
        .from('agents')
        .select('id, display_name, phone_number, operating_area, status')
        .eq('user_id', lead.agent_id)
        .single();
      agentProfile = agent;
    }

    return NextResponse.json({
      lead: {
        ...lead,
        media: media || [],
        agent_profile: agentProfile,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/accommodation/leads/[id]
// Actions:
//   update_status         — general status update
//   mark_duplicate        — flag as duplicate
//   link_property         — approve + link to property/unit
//   request_correction    — return to agent with feedback (agent submissions only)
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
    const {
      action, status, admin_notes,
      matched_property_id, matched_unit_id, duplicate_of,
      correction_message, // For agent correction_required
      photo_choice, // 'submitted' | 'upload' — which photos become verified
    } = body;

    const updates: Record<string, any> = {
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Get current submission for audit/notification
    const { data: existing } = await supabase
      .from('accommodation_submissions')
      .select('status, source_type, agent_id, submitted_by, property_name, agent_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // ── Action: update_status ──────────────────────────────────────────────────
    if (action === 'update_status') {
      updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
    }

    // ── Action: mark_duplicate ─────────────────────────────────────────────────
    if (action === 'mark_duplicate') {
      updates.status = 'duplicate';
      updates.is_duplicate = true;
      updates.duplicate_of = duplicate_of || null;
      if (admin_notes) updates.admin_notes = admin_notes;
    }

    // ── Action: link_property ──────────────────────────────────────────────────
    if (action === 'link_property') {
      if (matched_property_id) updates.matched_property_id = matched_property_id;
      if (matched_unit_id) updates.matched_unit_id = matched_unit_id;
      updates.status = 'approved';

      // Link the unit's primary_agent_id if this is an agent submission
      if (existing.source_type === 'agent' && matched_unit_id && existing.agent_id) {
        await supabase
          .from('accommodation_units')
          .update({
            source_type: 'agent',
            primary_agent_id: existing.agent_id,
          })
          .eq('id', matched_unit_id);
      }

      // Unless the admin opted to upload fresh photos, the submitted photos
      // become the unit's verified photos (they are what listing-card shows).
      if (matched_unit_id && matched_property_id && photo_choice !== 'upload') {
        const { data: submittedMedia, error: mediaError } = await supabase
          .from('accommodation_media')
          .select('id')
          .eq('submission_id', id)
          .eq('media_source', 'submission');

        if (mediaError) throw mediaError;

        if (submittedMedia && submittedMedia.length > 0) {
          const { error: promoteError } = await supabase
            .from('accommodation_media')
            .update({
              unit_id: matched_unit_id,
              property_id: matched_property_id,
              media_source: 'verified',
            })
            .eq('submission_id', id)
            .eq('media_source', 'submission');

          if (promoteError) throw promoteError;
        }
      }
    }

    // ── Action: request_correction (agent submissions only) ────────────────────
    if (action === 'request_correction') {
      if (existing.source_type !== 'agent') {
        return NextResponse.json(
          { error: 'Correction requests only apply to agent submissions' },
          { status: 400 }
        );
      }
      updates.status = 'correction_required';
      updates.admin_notes = correction_message || admin_notes || null;
    }

    // Apply updates
    const { data: lead, error } = await supabase
      .from('accommodation_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // ── Notifications ──────────────────────────────────────────────────────────
    const { sendNotification } = await import('@/utils/lib/services/notification-service');

    if (existing.source_type === 'agent' && existing.agent_id) {
      // Notify the agent
      const agentMessages: Record<string, { title: string; body: string } | null> = {
        approved: {
          title: '✅ Property submission approved!',
          body: `${existing.property_name} has been verified and listed on Campus&Me.`,
        },
        rejected: {
          title: 'Property submission update',
          body: `Your submission for ${existing.property_name} was not approved.`,
        },
        correction_required: {
          title: '📋 Correction needed',
          body: updates.admin_notes
            ? `${existing.property_name}: ${updates.admin_notes}`
            : `Your submission for ${existing.property_name} needs to be updated.`,
        },
        duplicate: {
          title: 'Property submission update',
          body: `${existing.property_name} was already listed on Campus&Me.`,
        },
      };

      const agentMsg = agentMessages[updates.status];
      if (agentMsg) {
        sendNotification({
          userId: existing.agent_id,
          type: 'accommodation',
          title: agentMsg.title,
          body: agentMsg.body,
          data: {
            submission_id: id,
            deeplink: `/agent/properties/${id}`,
          },
        }).catch(console.error);
      }

      // Log to agent audit events
      const { data: agentRecord } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', existing.agent_id)
        .single();

      if (agentRecord) {
        const EVENT_MAP: Record<string, string> = {
          approved: 'property_approved',
          rejected: 'property_rejected',
          correction_required: 'correction_requested',
          duplicate: 'property_rejected',
        };

        await supabase.from('agent_audit_events').insert({
          agent_id: agentRecord.id,
          actor_user_id: user.id,
          event_type: EVENT_MAP[updates.status] || 'status_changed',
          entity_type: 'property',
          entity_id: id,
          metadata: {
            old_status: existing.status,
            new_status: updates.status,
            property_name: existing.property_name,
            admin_notes: updates.admin_notes || null,
          },
        });
      }
    } else {
      // Notify the student who submitted
      const studentMessages: Record<string, { title: string; body: string }> = {
        approved: {
          title: 'Your submission was approved!',
          body: `${lead.property_name} has been verified and listed on Campus&Me.`,
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

      const msg = studentMessages[updates.status];
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