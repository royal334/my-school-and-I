import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Standard admin surface: bordered card on the page background. */
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}
