import { CheckCircle2, Coins, LoaderCircle, Wallet } from 'lucide-react';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { formatPrice } from './utils';
import type { ReferralStats } from './types';

function Stat({
  icon: Icon,
  value,
  label,
  valueClassName,
}: {
  icon: typeof Wallet;
  value: string;
  label: string;
  valueClassName: string;
}) {
  return (
    <Card className="p-3.5 shadow-[0_1px_4px_rgba(79,70,229,0.08)] transition-shadow duration-150 hover:shadow-[0_4px_12px_rgba(79,70,229,0.12)]">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 shrink-0 text-primary-500 dark:text-primary-300" aria-hidden />
        <p className="truncate text-[11px] font-medium text-stone-500 dark:text-stone-300">{label}</p>
      </div>
      <p className={cn('mt-1.5 font-mono text-xl font-medium leading-none', valueClassName)}>
        {value}
      </p>
    </Card>
  );
}

const ITEMS: Array<{
  key: keyof ReferralStats;
  icon: typeof Wallet;
  label: string;
  className: string;
  format: (stats: ReferralStats) => string;
}> = [
  {
    key: 'awaiting_payout',
    icon: Wallet,
    label: 'Awaiting payout',
    className: 'text-primary-600 dark:text-primary-300',
    format: (s) => String(s.awaiting_payout),
  },
  {
    key: 'processing',
    icon: LoaderCircle,
    label: 'Processing',
    className: 'text-info',
    format: (s) => String(s.processing),
  },
  {
    key: 'paid_count',
    icon: CheckCircle2,
    label: 'Rewards paid',
    className: 'text-success',
    format: (s) => String(s.paid_count),
  },
  {
    key: 'total_paid',
    icon: Coins,
    label: 'Total paid out',
    className: 'text-success',
    format: (s) => formatPrice(s.total_paid),
  },
];

export function ReferralStatsRow({ stats }: { stats: ReferralStats }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {ITEMS.map(({ icon, label, className, format }) => (
        <Stat
          key={label}
          icon={icon}
          label={label}
          value={format(stats)}
          valueClassName={className}
        />
      ))}
    </div>
  );
}
