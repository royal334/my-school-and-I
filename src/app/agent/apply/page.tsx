import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAgentProfile } from '@/utils/supabase/queries/agents';
import { AgentApplyForm } from '@/components/agent/apply/agent-apply-form';
import { AgentSignupForm } from '@/components/agent/apply/agent-signup-form';

export const metadata = {
  title: 'Become an agent | Campus&Me',
};

export default async function AgentApplyPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <AgentSignupForm />;

  // The application endpoint rejects duplicates, so send returning applicants
  // to their status page instead of showing a form that cannot be submitted.
  if (await getAgentProfile(supabase, user.id)) redirect('/agent/status');

  return <AgentApplyForm />;
}