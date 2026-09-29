'use client';

import { cn } from '@/lib/utils';
import { getFilterLabel } from './constants';

interface FilterChipsProps {
  filters: readonly string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Horizontally scrollable status filter pills. `''` renders as "All". */
export function FilterChips({ filters, value, onChange, className }: FilterChipsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
      {filters.map((filter) => {
        const selected = value === filter;

        return (
          <button
            key={filter || 'all'}
            type="button"
            onClick={() => onChange(filter)}
            aria-pressed={selected}
            className={cn(
              'shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors',
              selected
                ? 'border-primary-600 bg-primary-600 text-primary-foreground'
                : 'border-border bg-muted text-muted-foreground hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-300',
            )}
          >
            {getFilterLabel(filter)}
          </button>
        );
      })}
    </div>
  );
}
