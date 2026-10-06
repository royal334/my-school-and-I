'use client';

import { cn } from '@/lib/utils';
import { COMMISSION_FILTERS } from './types';

interface CommissionFilterTabsProps {
  value: string;
  onChange: (key: string) => void;
  pendingCount: number;
}

export function CommissionFilterTabs({
  value,
  onChange,
  pendingCount,
}: CommissionFilterTabsProps) {
  return (
    <div
      className="scrollbar-hide flex overflow-x-auto border-b border-border bg-card"
      role="tablist"
      aria-label="Filter commissions by status"
    >
      {COMMISSION_FILTERS.map(filter => {
        const active = value === filter.key;
        const badge = filter.key === 'pending_confirmation' ? pendingCount : 0;

        return (
          <button
            key={filter.key || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter.key)}
            className={cn(
              'flex shrink-0 cursor-pointer items-center whitespace-nowrap border-b-2 bg-transparent px-4 py-3 text-[13px] transition-colors',
              active
                ? 'border-primary font-semibold text-primary-600 dark:border-primary-300 dark:text-primary-300'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {filter.label}
            {badge > 0 && (
              <span className="ml-1.5 rounded-full bg-warning-bg px-1.5 py-0.5 text-[10px] font-semibold text-warning-text">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
