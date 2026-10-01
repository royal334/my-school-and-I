import { cn } from '@/lib/utils';
import { Card } from './card';
import type { AdminMaterialsStats, StatCardConfig } from './types';

export function StatsGrid({
  stats,
  configs,
  onSelect,
}: {
  stats: AdminMaterialsStats | null;
  configs: StatCardConfig[];
  onSelect?: (config: StatCardConfig) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {configs.map((config) => (
        <StatTile
          key={config.key}
          config={config}
          value={stats ? String(stats[config.key]) : '—'}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function StatTile({
  config,
  value,
  onSelect,
}: {
  config: StatCardConfig;
  value: string;
  onSelect?: (config: StatCardConfig) => void;
}) {
  const { icon: Icon, label, className, tab } = config;
  const interactive = Boolean(onSelect) && tab !== 'overview';

  const body = (
    <>
      <span className="flex items-center gap-1.5">
        <Icon
          className="size-3.5 shrink-0 text-primary-500 dark:text-primary-300"
          aria-hidden
        />
        <span className="truncate text-[11px] font-medium text-stone-500 dark:text-stone-300">
          {label}
        </span>
      </span>
      <span
        className={cn(
          'mt-1.5 font-mono text-xl font-medium leading-none text-stone-600 dark:text-stone-100',
          className,
        )}
      >
        {value}
      </span>
    </>
  );

  if (!interactive) {
    return <Card className="p-3.5">{body}</Card>;
  }

  return (
    <Card className="p-0">
      <button
        type="button"
        onClick={() => onSelect?.(config)}
        className={cn(
          'flex w-full cursor-pointer flex-col p-3.5 text-left transition-all duration-150',
          'hover:border-primary-300 hover:shadow-md dark:hover:border-primary-500/50',
        )}
      >
        {body}
      </button>
    </Card>
  );
}
