import { cn } from '@/lib/utils';
import { TONE_CLASSES, getAgentStatusMeta } from '@/components/agent/status-meta';

export function AgentStatusPill({ status, className }: { status: string; className?: string }) {
  const meta = getAgentStatusMeta(status);

  return (
    <span
      className={cn(
        'whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium',
        TONE_CLASSES[meta.tone].badge,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}