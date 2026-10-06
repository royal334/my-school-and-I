import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';
import { getAgents } from '@/utils/supabase/queries/agents';
import { AgentsDashboard } from '@/components/admin/accommodation/agents/agents-dashboard';
import {
  AGENTS_PAGE_SIZE,
  isAgentFilterKey,
  type AgentFilterKey,
} from '@/components/admin/accommodation/agents/constants';

export const metadata = {
  title: 'Admin · Agent applications',
};

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!(await isUserAdmin(user.id, supabase))) redirect('/dashboard');

  const { status } = await searchParams;
  const filter: AgentFilterKey = status && isAgentFilterKey(status) ? status : 'pending_review';

  const { agents, total } = await getAgents(supabase, filter, AGENTS_PAGE_SIZE);

  return <AgentsDashboard initialAgents={agents} initialTotal={total} initialFilter={filter} />;
}