import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { ID_TYPES, OPERATING_AREAS } from '@/components/agent/constants';
import { passwordStrengthSchema } from '@/lib/validations/password';
import {
  removeAgentIdDocument,
  uploadAgentIdDocument,
} from '@/utils/agent-documents';

const PHONE_PATTERN = /^(\+234|0)[789]\d{9}$/;

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  let userId: string | null = null;
  let documentPath: string | null = null;

  try {
    const formData = await request.formData();
    const fullName = getText(formData, 'full_name');
    const displayName = getText(formData, 'display_name');
    const phoneNumber = getText(formData, 'phone_number');
    const email = getText(formData, 'email').toLowerCase();
    const passwordValue = formData.get('password');
    const password = typeof passwordValue === 'string' ? passwordValue : '';
    const bio = getText(formData, 'bio');
    const idType = getText(formData, 'id_type');
    const areas = formData
      .getAll('operating_areas')
      .filter((value): value is string => typeof value === 'string');
    const fileValue = formData.get('id_document');
    const idDocument =
      fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

    if (fullName.length < 3 || displayName.length < 2) {
      return NextResponse.json({ error: 'Enter your full name and agent name.' }, { status: 400 });
    }
    if (!PHONE_PATTERN.test(phoneNumber)) {
      return NextResponse.json({ error: 'Enter a valid Nigerian phone number.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    const passwordResult = passwordStrengthSchema.safeParse(password);
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: passwordResult.error.issues[0]?.message || 'Enter a valid password.' },
        { status: 400 },
      );
    }
    if (
      areas.length === 0 ||
      areas.some((area) => !OPERATING_AREAS.some((allowedArea) => allowedArea === area))
    ) {
      return NextResponse.json({ error: 'Select at least one valid operating area.' }, { status: 400 });
    }
    if (idType && !ID_TYPES.some((allowedType) => allowedType === idType)) {
      return NextResponse.json({ error: 'Select a valid ID type.' }, { status: 400 });
    }
    if (idDocument && !idType) {
      return NextResponse.json({ error: 'Select an ID type for the uploaded document.' }, { status: 400 });
    }

    const supabase = createClient(await cookies());
    const admin = createAdminClient();

    const { data: existingProfile, error: profileLookupError } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileLookupError) throw profileLookupError;
    if (existingProfile) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const origin = new URL(request.url).origin;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback?next=%2Fagent%2Fstatus`,
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          account_type: 'agent',
        },
      },
    });

    if (authError) {
      if (/already (registered|exists)/i.test(authError.message)) {
        return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    if (!authData.user) {
      return NextResponse.json({ error: 'Could not create the account.' }, { status: 500 });
    }

    userId = authData.user.id;

    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        phone_number: phoneNumber,
        account_type: 'agent',
      },
      { onConflict: 'id' },
    );
    if (profileError) throw profileError;

    if (idDocument) {
      documentPath = await uploadAgentIdDocument(userId, idDocument);
    }

    const { data: agent, error: agentError } = await admin
      .from('agents')
      .insert({
        user_id: userId,
        display_name: displayName,
        phone_number: phoneNumber,
        operating_area: areas.join(', '),
        bio: bio || null,
        id_type: idType || null,
        id_doc_path: documentPath,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (agentError) throw agentError;

    const { error: auditError } = await admin.from('agent_audit_events').insert({
      agent_id: agent.id,
      actor_user_id: userId,
      event_type: 'application_submitted',
      entity_type: 'agent',
      entity_id: agent.id,
      metadata: { display_name: displayName, operating_area: areas.join(', ') },
    });
    if (auditError) throw auditError;

    const { data: admins, error: adminsError } = await admin
      .from('admin_roles')
      .select('user_id')
      .in('role', ['super_admin', 'admin']);
    if (adminsError) throw adminsError;

    if (admins && admins.length > 0) {
      const { sendBulkNotification } = await import(
        '@/utils/lib/services/notification-service'
      );
      sendBulkNotification({
        userIds: admins.map((adminUser) => adminUser.user_id),
        type: 'accommodation',
        title: 'New agent application',
        body: `${displayName} has applied to become an accommodation agent.`,
        data: {
          agent_id: agent.id,
          deeplink: `/admin/accommodation/agents/${agent.id}`,
        },
      }).catch(console.error);
    }

    return NextResponse.json(
      {
        success: true,
        requiresEmailConfirmation: !authData.session,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Agent signup error:', error);

    if (documentPath) {
      await removeAgentIdDocument(documentPath).catch((cleanupError) => {
        console.error('Failed to remove agent ID document after signup failure:', cleanupError);
      });
    }
    if (userId) {
      const admin = createAdminClient();
      const { error: agentCleanupError } = await admin
        .from('agents')
        .delete()
        .eq('user_id', userId);
      if (agentCleanupError) {
        console.error('Failed to remove agent record after signup failure:', agentCleanupError);
      }
      const { error: profileCleanupError } = await admin
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (profileCleanupError) {
        console.error('Failed to remove profile after signup failure:', profileCleanupError);
      }
      await admin.auth.admin.deleteUser(userId).catch((cleanupError) => {
        console.error('Failed to roll back agent account:', cleanupError);
      });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Could not create your agent account.',
      },
      { status: 500 },
    );
  }
}
