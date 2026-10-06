import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AgentDashboardView } from '@/components/agent/dashboard/agent-dashboard-view';

export const metadata = {
  title: 'Agent dashboard | Campus&Me',
};

export default async function AgentDashboardPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=%2Fagent');

  return <AgentDashboardView />;
}
