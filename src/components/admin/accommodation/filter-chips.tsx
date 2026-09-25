import { cn } from '@/lib/utils';

export function FilterChips({
  filters,
  value,
  onChange,
  formatLabel,
}: {
  filters: string[];
  value: string;
  onChange: (f: string) => void;
  formatLabel?: (f: string) => string;
}) {
  const label = formatLabel || ((f: string) => f || 'All');
  return (
    <div className="mb-3.5 flex gap-2 overflow-x-auto pb-1">
      {filters.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={cn(
            'shrink-0 cursor-pointer whitespace-nowrap rounded-full border-none px-3.5 py-1.5 text-xs font-medium capitalize',
            value === f ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-primary-300',
          )}
        >
          {label(f)}
        </button>
      ))}
    </div>
  );
}