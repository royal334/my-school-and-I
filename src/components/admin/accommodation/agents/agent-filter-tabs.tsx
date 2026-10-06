'use client';

import { cn } from '@/lib/utils';
import { AGENT_FILTERS } from './constants';

export function AgentFilterTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div
      className="flex overflow-x-auto border-b border-border bg-card scrollbar-hide"
      role="tablist"
      aria-label="Filter agents by status"
    >
      {AGENT_FILTERS.map(filter => {
        const active = value === filter.key;
        return (
          <button
            key={filter.key || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter.key)}
            className={cn(
              'shrink-0 cursor-pointer whitespace-nowrap border-b-2 bg-transparent px-4 py-3 text-[13px] transition-colors',
              active
                ? 'border-primary-500 font-medium text-primary-700 dark:border-primary-300 dark:text-primary-300'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}