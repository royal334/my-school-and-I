import { format } from 'date-fns';
import { BadgeCheck } from 'lucide-react';
import type { CommissionRecord } from './types';

export function PaymentRecordedInfo({ record }: { record: CommissionRecord }) {
  if (record.status !== 'payment_recorded' || !record.payment_recorded_at) return null;

  return (
    <div className="mb-3 rounded-lg border border-success/25 bg-success-bg px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-success-text">
        <BadgeCheck className="size-3.5" aria-hidden />
        Payment recorded by Campus&Me
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {format(new Date(record.payment_recorded_at), 'MMMM d, yyyy')}
      </p>
      {record.payment_reference && (
        <p className="mt-0.5 text-xs text-muted-foreground">Ref: {record.payment_reference}</p>
      )}
      {record.payment_notes && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {record.payment_notes}
        </p>
      )}
    </div>
  );
}
