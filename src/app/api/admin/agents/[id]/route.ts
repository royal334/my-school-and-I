// app/api/admin/agents/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
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

// GET /api/admin/agents/[id]
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

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    let idDocumentUrl: string | null = null;
    if (agent.id_doc_path) {
      const { data, error: signedUrlError } = await createAdminClient()
        .storage
        .from('agent-verification-docs')
        .createSignedUrl(agent.id_doc_path, 300);
      if (signedUrlError) throw signedUrlError;
      idDocumentUrl = data.signedUrl;
    }

    // Get their recent submissions
    const { data: submissions } = await supabase
      .from('accommodation_submissions')
      .select('id, property_name, area, room_type, status, created_at')
      .eq('agent_id', agent.user_id)
      .eq('source_type', 'agent')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent audit events
    const { data: auditEvents } = await supabase
      .from('agent_audit_events')
      .select('id, event_type, entity_type, metadata, created_at')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      agent,
      id_document_url: idDocumentUrl,
      recent_submissions: submissions || [],
      audit_events: auditEvents || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/agents/[id] - Update agent status
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
    const { status, review_note, agent_feedback } = body;

    const VALID_STATUSES = [
      'approved', 'rejected', 'more_information_required',
      'suspended', 'deactivated',
    ];

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get current agent state for audit
    const { data: existing } = await supabase
      .from('agents')
      .select('status, user_id, display_name')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Update agent
    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        status,
        review_note: review_note || null,          // Staff-only, not shown to agent
        agent_feedback: agent_feedback || null,     // Shown to agent
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    await supabase.from('agent_audit_events').insert({
      agent_id: id,
      actor_user_id: user.id,
      event_type: 'status_changed',
      entity_type: 'agent',
      entity_id: id,
      metadata: {
        old_status: existing.status,
        new_status: status,
        has_feedback: !!agent_feedback,
      },
    });

    // Notify agent
    const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
      approved: {
        title: '✅ Agent application approved!',
        body: 'You can now submit accommodation properties on Campus&Me.',
      },
      rejected: {
        title: 'Agent application update',
        body: agent_feedback || 'Your application was not approved at this time.',
      },
      more_information_required: {
        title: 'More information needed',
        body: agent_feedback || 'We need more information about your application.',
      },
      suspended: {
        title: 'Account suspended',
        body: agent_feedback || 'Your agent account has been suspended.',
      },
      deactivated: {
        title: 'Account deactivated',
        body: agent_feedback || 'Your agent account has been deactivated.',
      },
    };

    const notif = STATUS_MESSAGES[status];
    if (notif) {
      const { sendNotification } = await import(
        '@/utils/lib/services/notification-service'
      );
      sendNotification({
        userId: existing.user_id,
        type: 'accommodation',
        title: notif.title,
        body: notif.body,
        data: {
          agent_id: id,
          deeplink: '/agent/status',
        },
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}