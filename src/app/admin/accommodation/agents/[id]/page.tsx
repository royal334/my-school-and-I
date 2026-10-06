import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isUserAdmin } from '@/utils/supabase/queries';
import { getAgentDetail } from '@/utils/supabase/queries/agents';
import { AgentDetailView } from '@/components/admin/accommodation/agents/detail/agent-detail-view';
import { AgentNotFound } from '@/components/admin/accommodation/agents/detail/agent-not-found';

export const metadata = {
  title: 'Admin · Agent application',
};

export default async function AdminAgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!(await isUserAdmin(user.id, supabase))) redirect('/dashboard');

  const snapshot = await getAgentDetail(supabase, id);
  if (!snapshot) return <AgentNotFound />;

  const admin = createAdminClient();
  const { data: agentDocument, error: documentLookupError } = await admin
    .from('agents')
    .select('id_doc_path')
    .eq('id', id)
    .maybeSingle();
  if (documentLookupError) throw documentLookupError;

  let idDocumentUrl: string | null = null;
  if (agentDocument?.id_doc_path) {
    const { data, error } = await admin.storage
      .from('agent-verification-docs')
      .createSignedUrl(agentDocument.id_doc_path, 300);
    if (error) throw error;
    idDocumentUrl = data.signedUrl;
  }

  return (
    <AgentDetailView
      agent={snapshot.agent}
      submissions={snapshot.recent_submissions}
      auditEvents={snapshot.audit_events}
      idDocumentUrl={idDocumentUrl}
    />
  );
}