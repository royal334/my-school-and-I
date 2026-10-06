import { CheckCircle2, Home, KeyRound, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardAgent } from './types';

const STATS: Array<{
  key: 'total_properties_submitted' | 'total_properties_approved' | 'total_transactions';
  label: string;
  icon: LucideIcon;
  valueClass: string;
}> = [
  {
    key: 'total_properties_submitted',
    label: 'Submitted',
    icon: Home,
    valueClass: 'text-accent-600 dark:text-accent-400',
  },
  {
    key: 'total_properties_approved',
    label: 'Approved',
    icon: CheckCircle2,
    valueClass: 'text-success-text',
  },
  {
    key: 'total_transactions',
    label: 'Rentals',
    icon: KeyRound,
    valueClass: 'text-primary-600 dark:text-primary-300',
  },
];

export function DashboardStatsGrid({ agent }: { agent: DashboardAgent }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {STATS.map(({ key, label, icon: Icon, valueClass }) => (
        <div
          key={key}
          className="rounded-xl border border-border bg-card px-2.5 py-3.5 text-center"
        >
          <Icon className={cn('mx-auto mb-1.5 size-3.5', valueClass)} aria-hidden />
          <p className={cn('font-mono text-2xl font-semibold leading-none', valueClass)}>
            {agent[key]}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
