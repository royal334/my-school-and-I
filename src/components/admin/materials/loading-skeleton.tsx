import { cn } from '@/lib/utils';

export function LoadingSkeleton({
  count = 4,
  height = 120,
  className,
}: {
  count?: number;
  /** Row height in px. */
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[#D6E5DF] bg-primary-50/60 dark:border-white/10 dark:bg-white/5"
          style={{ height }}
        />
      ))}
    </div>
  );
}
