import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#D6E5DF] bg-white p-4 dark:border-white/10 dark:bg-card',
        className,
      )}
      {...props}
    />
  );
}