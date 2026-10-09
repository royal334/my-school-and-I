// app/api/agent/profile/verification/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  removeAgentIdDocument,
  uploadAgentIdDocument,
} from '@/utils/agent-documents';
import { ID_TYPES } from '@/components/agent/constants';

// POST /api/agent/profile/verification - Submit or replace the agent's ID document
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, id_doc_path')
      .eq('user_id', user.id)
      .maybeSingle();

    if (agentError) throw agentError;
    if (!agent) {
      return NextResponse.json(
        { error: 'No agent application found. Please apply first.' },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const id_type = String(formData.get('id_type') || '').trim();
    const fileValue = formData.get('id_document');
    const idDocument =
      fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

    if (!ID_TYPES.some((allowedType) => allowedType === id_type)) {
      return NextResponse.json({ error: 'Select a valid ID type.' }, { status: 400 });
    }
    if (!idDocument) {
      return NextResponse.json({ error: 'Upload your ID document.' }, { status: 400 });
    }

    const previousPath = agent.id_doc_path;
    let newPath: string | null = null;

    try {
      newPath = await uploadAgentIdDocument(user.id, idDocument);

      const { error } = await supabase
        .from('agents')
        .update({
          id_type,
          id_doc_path: newPath,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      if (newPath) {
        await removeAgentIdDocument(newPath).catch((cleanupError) => {
          console.error('Failed to remove replacement ID document:', cleanupError);
        });
      }
      throw error;
    }

    if (previousPath && previousPath !== newPath) {
      await removeAgentIdDocument(previousPath).catch((cleanupError) => {
        console.error('Failed to remove previous ID document:', cleanupError);
      });
    }

    await supabase.from('agent_audit_events').insert({
      agent_id: agent.id,
      actor_user_id: user.id,
      event_type: 'verification_submitted',
      entity_type: 'agent',
      entity_id: agent.id,
      metadata: { id_type },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not submit your verification.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
