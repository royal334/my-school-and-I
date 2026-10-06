import { formatDistanceToNow } from 'date-fns';
import { History } from 'lucide-react';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { EVENT_LABELS } from '@/components/admin/accommodation/agents/detail/constants';
import type { AgentAuditEvent } from '@/components/agent/types';
import { LeadCard } from './lead-card';

function StatusTransition({ metadata }: { metadata: AgentAuditEvent['metadata'] }) {
  const oldStatus = metadata?.old_status;
  const newStatus = metadata?.new_status;

  if (typeof oldStatus !== 'string' || typeof newStatus !== 'string') return null;

  return (
    <p className="mt-0.5 text-[11px] text-muted-foreground capitalize">
      {oldStatus.replace(/_/g, ' ')} → {newStatus.replace(/_/g, ' ')}
    </p>
  );
}

/** Only agent submissions generate audit events, so this stays hidden for
 *  student leads. */
export function LeadAuditTrail({ events }: { events: AgentAuditEvent[] }) {
  if (events.length === 0) return null;

  return (
    <LeadCard>
      <SectionTitle>Audit trail</SectionTitle>
      <ul className="flex flex-col">
        {events.map(event => (
          <li
            key={event.id}
            className="flex items-start justify-between gap-3 border-b border-primary-100 py-2.5 last:border-b-0 dark:border-primary-500/25"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[13px] text-foreground">
                <History
                  className="size-3.5 shrink-0 text-primary-600 dark:text-primary-300"
                  aria-hidden
                />
                {EVENT_LABELS[event.event_type] ?? event.event_type.replace(/_/g, ' ')}
              </p>
              <StatusTransition metadata={event.metadata} />
            </div>
            <span className="shrink-0 text-[11px] whitespace-nowrap text-muted-foreground">
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
            </span>
          </li>
        ))}
      </ul>
    </LeadCard>
  );
}