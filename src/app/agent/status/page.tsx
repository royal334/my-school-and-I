import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAgentProfile } from '@/utils/supabase/queries/agents';
import { AgentStatusView } from '@/components/agent/status/agent-status-view';

export const metadata = {
  title: 'Agent portal | Campus&Me',
};

export default async function AgentStatusPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const agent = await getAgentProfile(supabase, user.id);

  return <AgentStatusView agent={agent} />;
}