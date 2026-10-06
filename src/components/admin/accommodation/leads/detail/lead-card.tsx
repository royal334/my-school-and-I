import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/admin/accommodation/card';

/** Card surface for the lead detail screen — tinted to the primary (purple)
 *  palette instead of the legacy green hairline used by the shared Card. */
export function LeadCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn('border-primary-100 dark:border-primary-500/25', className)}
      {...props}
    />
  );
}