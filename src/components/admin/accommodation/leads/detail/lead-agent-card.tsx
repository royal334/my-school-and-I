import { Building2, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import type { AgentProfile } from '@/components/admin/accommodation/types';
import { LeadCard } from './lead-card';

const APPROVED = 'approved';

function AgentStatusPill({ status }: { status: string }) {
  const approved = status === APPROVED;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase',
        approved
          ? 'bg-success-bg text-success'
          : 'bg-warning-bg text-warning-text dark:bg-warning-bg',
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

/** Agent submissions are vetted differently from student ones, so the agent's
 *  identity, reach and standing get their own highlighted card. */
export function LeadAgentCard({ agent }: { agent: AgentProfile }) {
  return (
    <LeadCard className="border-accent-500/25 bg-accent-500/[0.07] dark:bg-accent-500/[0.1]">
      <SectionTitle>Submitted by agent</SectionTitle>

      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Building2 className="size-3.5 shrink-0 text-accent-600 dark:text-accent-400" aria-hidden />
        {agent.display_name}
      </p>

      <div className="mt-2 flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="size-3 shrink-0 text-primary-500 dark:text-primary-400" aria-hidden />
          {agent.phone_number}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0 text-primary-500 dark:text-primary-400" aria-hidden />
          {agent.operating_area}
        </p>
      </div>

      <div className="mt-2.5">
        <AgentStatusPill status={agent.status} />
      </div>
    </LeadCard>
  );
}