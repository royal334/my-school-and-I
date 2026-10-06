import { format } from 'date-fns';
import { BadgeCheck } from 'lucide-react';
import type { AdminCommission } from './types';

export function CommissionPaymentInfo({ commission }: { commission: AdminCommission }) {
  if (commission.status !== 'payment_recorded') return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg border border-success/25 bg-success-bg px-3 py-2 text-xs text-success-text">
      <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
      <span className="font-medium">Payment recorded</span>
      {commission.payment_recorded_at && (
        <span className="text-success-text/80">
          · {format(new Date(commission.payment_recorded_at), 'MMM d, yyyy')}
        </span>
      )}
      {commission.payment_reference && (
        <span className="text-success-text/80">· Ref: {commission.payment_reference}</span>
      )}
    </div>
  );
}
