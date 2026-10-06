import { Building2, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeadDetail } from '@/components/admin/accommodation/types';

export function isAgentLead(lead: LeadDetail) {
  return lead.source_type === 'agent';
}

/** Tells staff at a glance whether a submission came from a student or a
 *  registered agent, since the review rules differ between the two. */
export function LeadSourceBadge({
  sourceType,
  onDark = false,
}: {
  sourceType: string | undefined;
  onDark?: boolean;
}) {
  const isAgent = sourceType === 'agent';
  const Icon = isAgent ? Building2 : GraduationCap;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase',
        onDark
          ? isAgent
            ? 'bg-accent-500/20 text-accent-300'
            : 'bg-primary-400/20 text-primary-200'
          : isAgent
            ? 'bg-accent-500/15 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300'
            : 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-200',
      )}
    >
      <Icon className="size-3" aria-hidden />
      {isAgent ? 'Agent' : 'Student'}
    </span>
  );
}