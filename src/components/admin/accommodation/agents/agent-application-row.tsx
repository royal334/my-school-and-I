import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_CLASSES, getAgentStatusMeta } from '@/components/agent/status-meta';
import { AgentStatusPill } from './agent-status-pill';
import type { AgentProfile } from '@/components/agent/types';

export function AgentApplicationRow({ agent }: { agent: AgentProfile }) {
  const meta = getAgentStatusMeta(agent.status);
  const tone = TONE_CLASSES[meta.tone];

  return (
    <Link
      href={`/admin/accommodation/agents/${agent.id}`}
      className={cn(
        'block overflow-hidden rounded-xl border border-border bg-card no-underline transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        'motion-reduce:transform-none motion-reduce:transition-none',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5',
          tone.card,
        )}
      >
        <AgentStatusPill status={agent.status} />
        <span className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(agent.submitted_at), { addSuffix: true })}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-[15px] font-medium tracking-tight text-foreground">
          {agent.display_name}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3 shrink-0" aria-hidden />
            {agent.operating_area}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="size-3 shrink-0" aria-hidden />
            {agent.phone_number}
          </span>
        </div>

        {agent.status === 'approved' && (
          <dl className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
            <div className="flex gap-1">
              <dt>Submitted</dt>
              <dd className="font-mono font-medium text-foreground">
                {agent.total_properties_submitted}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>Approved</dt>
              <dd className="font-mono font-medium text-foreground">
                {agent.total_properties_approved}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>Rentals</dt>
              <dd className="font-mono font-medium text-foreground">
                {agent.total_transactions}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </Link>
  );
}