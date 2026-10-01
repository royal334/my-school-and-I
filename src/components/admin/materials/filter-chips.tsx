import { cn } from '@/lib/utils';
import { getFilterLabel } from './constants';

export function FilterChips({
  filters,
  value,
  onChange,
  className,
}: {
  filters: readonly string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
      {filters.map((filter) => {
        const selected = value === filter;

        return (
          <button
            key={filter || 'all'}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(filter)}
            className={cn(
              'shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors',
              selected
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-[#D6E5DF] bg-primary-50 text-primary-600 hover:border-primary-300 dark:border-white/10 dark:bg-white/10 dark:text-primary-300',
            )}
          >
            {getFilterLabel(filter)}
          </button>
        );
      })}
    </div>
  );
}
