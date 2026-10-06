import { AgentStatusHeader } from './agent-status-header';
import { ApplicationDetailsCard } from './application-details-card';
import { ApplicationStatusCard } from './application-status-card';
import { AgentPerformanceStats } from './agent-performance-stats';
import { ApplyPrompt } from './apply-prompt';
import { SupportNote } from './support-note';
import { getAgentStatusMeta } from '../status-meta';
import type { AgentProfile } from '../types';

export function AgentStatusView({ agent }: { agent: AgentProfile | null }) {
  if (!agent) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AgentStatusHeader />
        <ApplyPrompt />
      </div>
    );
  }

  const meta = getAgentStatusMeta(agent.status);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AgentStatusHeader subtitle={agent.display_name} />

      <div className="flex flex-col gap-3 p-4">
        <ApplicationStatusCard
          tone={meta.tone}
          icon={meta.icon}
          title={meta.title}
          description={meta.description}
          feedback={agent.agent_feedback}
          cta={meta.cta}
        />

        <ApplicationDetailsCard agent={agent} />

        {agent.status === 'approved' && <AgentPerformanceStats agent={agent} />}
      </div>

      <SupportNote />
    </div>
  );
}