'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { DetailHeader } from '@/components/admin/accommodation/detail-header';
import { AgentPerformanceStats } from '@/components/agent/status/agent-performance-stats';
import { AgentStatusPill } from '../agent-status-pill';
import { AgentActionPanel } from './agent-action-panel';
import { AgentProfileCard } from './agent-profile-card';
import { AgentNoteCard } from './agent-note-card';
import { AgentSubmissionsCard } from './agent-submissions-card';
import { AgentAuditTrail } from './agent-audit-trail';
import type { AgentAuditEvent, AgentSubmission, AdminAgent } from '@/components/agent/types';

export function AgentDetailView({
  agent: initialAgent,
  submissions,
  auditEvents,
  idDocumentUrl,
}: {
  agent: AdminAgent;
  submissions: AgentSubmission[];
  auditEvents: AgentAuditEvent[];
  idDocumentUrl: string | null;
}) {
  const router = useRouter();
  const [agent, setAgent] = useState<AdminAgent>(initialAgent);

  return (
    <div className="min-h-screen bg-background pb-20">
      <DetailHeader
        title={agent.display_name}
        subtitle={`Agent application · ${formatDistanceToNow(new Date(agent.submitted_at), { addSuffix: true })}`}
        badge={<AgentStatusPill status={agent.status} />}
        onBack={() => router.back()}
      />

      <div className="flex flex-col gap-3 p-4">
        <AgentActionPanel agent={agent} onUpdate={setAgent} />

        <AgentProfileCard agent={agent} idDocumentUrl={idDocumentUrl} />

        {agent.agent_feedback && (
          <AgentNoteCard
            tone="info"
            title="Feedback sent to agent"
            note={agent.agent_feedback}
          />
        )}

        {agent.review_note && (
          <AgentNoteCard
            tone="warning"
            title="Internal note (staff only)"
            note={agent.review_note}
          />
        )}

        {agent.status === 'approved' && <AgentPerformanceStats agent={agent} />}

        <AgentSubmissionsCard submissions={submissions} />

        <AgentAuditTrail events={auditEvents} />
      </div>
    </div>
  );
}