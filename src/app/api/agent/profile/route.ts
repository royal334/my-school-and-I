// app/api/agent/profile/route.ts
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  removeAgentIdDocument,
  uploadAgentIdDocument,
} from '@/utils/agent-documents';
import { ID_TYPES } from '@/components/agent/constants';

// GET /api/agent/profile - Get current user's agent profile
export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .select(`
        id, user_id, display_name, phone_number, operating_area, bio,
        id_type, status, submitted_at, reviewed_at, agent_feedback,
        total_properties_submitted, total_properties_approved, total_transactions,
        created_at, updated_at
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!agent) return NextResponse.json({ agent: null });

    const { count: totalTransactions, error: transactionCountError } =
      await createAdminClient()
        .from('agent_commission_records')
        .select('id', { count: 'exact', head: true })
        .eq('agent_id', agent.id);

    if (transactionCountError) throw transactionCountError;

    return NextResponse.json({
      agent: {
        ...agent,
        total_transactions: totalTransactions ?? 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/agent/profile - Submit agent application
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from('agents')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted an application', agent: existing },
        { status: 400 }
      );
    }

    const isMultipart = request.headers
      .get('content-type')
      ?.includes('multipart/form-data');
    let display_name: string;
    let phone_number: string;
    let operating_area: string;
    let bio: string;
    let id_type: string;
    let idDocument: File | null = null;

    if (isMultipart) {
      const formData = await request.formData();
      display_name = String(formData.get('display_name') || '').trim();
      phone_number = String(formData.get('phone_number') || '').trim();
      operating_area = String(formData.get('operating_area') || '').trim();
      bio = String(formData.get('bio') || '').trim();
      id_type = String(formData.get('id_type') || '').trim();
      const file = formData.get('id_document');
      idDocument = file instanceof File && file.size > 0 ? file : null;
    } else {
      const body = await request.json();
      display_name = String(body.display_name || '').trim();
      phone_number = String(body.phone_number || '').trim();
      operating_area = String(body.operating_area || '').trim();
      bio = String(body.bio || '').trim();
      id_type = String(body.id_type || '').trim();
    }

    if (!display_name || !phone_number || !operating_area) {
      return NextResponse.json(
        { error: 'display_name, phone_number and operating_area are required' },
        { status: 400 }
      );
    }

    if (id_type && !ID_TYPES.some((allowedType) => allowedType === id_type)) {
      return NextResponse.json({ error: 'Select a valid ID type.' }, { status: 400 });
    }

    if (idDocument && !id_type) {
      return NextResponse.json(
        { error: 'Select an ID type for the uploaded document.' },
        { status: 400 },
      );
    }

    let idDocPath: string | null = null;
    let createdAgentId: string | null = null;
    try {
      if (idDocument) idDocPath = await uploadAgentIdDocument(user.id, idDocument);

      const { data: agent, error } = await supabase
        .from('agents')
        .insert({
          user_id: user.id,
          display_name,
          phone_number,
          operating_area,
          bio: bio || null,
          id_type: id_type || null,
          id_doc_path: idDocPath,
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      createdAgentId = agent.id;

      const { error: profileError } = await createAdminClient()
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name || display_name,
          phone_number,
          account_type: 'agent',
        }, { onConflict: 'id' });
      if (profileError) throw profileError;

      // Log audit event
      await supabase.from('agent_audit_events').insert({
        agent_id: agent.id,
        actor_user_id: user.id,
        event_type: 'application_submitted',
        entity_type: 'agent',
        entity_id: agent.id,
        metadata: { display_name, operating_area },
      });

      // Notify admins
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
          title: 'New agent application',
          body: `${display_name} has applied to become an accommodation agent.`,
          data: {
            agent_id: agent.id,
            deeplink: `/admin/accommodation/agents/${agent.id}`,
          },
        }).catch(console.error);
      }

      return NextResponse.json({
        success: true,
        agent,
        message: 'Application submitted. We will review it and get back to you.',
      });
    } catch (error) {
      if (createdAgentId) {
        const { error: cleanupError } = await createAdminClient()
          .from('agents')
          .delete()
          .eq('id', createdAgentId);
        if (cleanupError) {
          console.error('Failed to remove agent profile after application failure:', cleanupError);
        }
      }
      if (idDocPath) {
        await removeAgentIdDocument(idDocPath).catch((cleanupError) => {
          console.error('Failed to remove agent ID document after application failure:', cleanupError);
        });
      }
      throw error;
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/agent/profile - Update own profile details (not status)
export async function PATCH(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, phone_number, operating_area, bio } = body;

    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        display_name,
        phone_number,
        operating_area,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select('id, display_name, phone_number, operating_area, bio, status')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}