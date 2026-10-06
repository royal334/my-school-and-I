import { CheckCircle2, Home, KeyRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AgentProfile } from '../types';

const STATS: Array<{
  key: 'total_properties_submitted' | 'total_properties_approved' | 'total_transactions';
  label: string;
  icon: LucideIcon;
}> = [
  { key: 'total_properties_submitted', label: 'Submitted', icon: Home },
  { key: 'total_properties_approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'total_transactions', label: 'Rentals', icon: KeyRound },
];

export function AgentPerformanceStats({ agent }: { agent: AgentProfile }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {STATS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="rounded-xl border border-border bg-card px-2.5 py-3.5 text-center"
        >
          <Icon
            className="mx-auto mb-1.5 size-3.5 text-primary-500 dark:text-primary-300"
            aria-hidden
          />
          <p className="font-mono text-2xl font-semibold leading-none text-foreground">
            {agent[key]}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}