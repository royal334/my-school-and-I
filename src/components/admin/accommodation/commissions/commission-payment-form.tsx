'use client';

import { useState } from 'react';
import { Banknote, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNairaMinor } from './constants';
import type { AdminCommission } from './types';

const inputClass =
  'w-full rounded-lg border border-input bg-card px-3 py-2.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-[3px] focus:ring-primary/15 dark:bg-white/[0.03]';

interface CommissionPaymentFormProps {
  commission: AdminCommission;
  saving: boolean;
  error: string;
  onSubmit: (values: { paymentReference: string; paymentNotes: string }) => void;
  onCancel: () => void;
}

export function CommissionPaymentForm({
  commission,
  saving,
  error,
  onSubmit,
  onCancel,
}: CommissionPaymentFormProps) {
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  return (
    <div className="mt-3 flex flex-col gap-2.5 rounded-lg border border-primary-200 bg-primary-50/60 p-3 dark:border-primary-500/25 dark:bg-primary-500/10">
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-primary-700 dark:text-primary-100">
        <Banknote className="size-3.5 shrink-0" aria-hidden />
        Record off-platform payment of{' '}
        <span className="font-mono">{formatNairaMinor(commission.agent_commission_minor)}</span>
      </p>

      <div>
        <label
          htmlFor={`commission-ref-${commission.id}`}
          className="mb-1 block text-xs text-muted-foreground"
        >
          Payment reference (optional)
        </label>
        <input
          id={`commission-ref-${commission.id}`}
          value={paymentReference}
          onChange={e => setPaymentReference(e.target.value)}
          placeholder="e.g. transfer ref or teller number"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor={`commission-notes-${commission.id}`}
          className="mb-1 block text-xs text-muted-foreground"
        >
          Notes (optional)
        </label>
        <textarea
          id={`commission-notes-${commission.id}`}
          rows={2}
          value={paymentNotes}
          onChange={e => setPaymentNotes(e.target.value)}
          placeholder="How and when was this paid out?"
          className={cn(inputClass, 'resize-y')}
        />
      </div>

      {error && <p className="text-xs text-error-text">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSubmit({ paymentReference, paymentNotes })}
          disabled={saving}
          className="flex min-h-[40px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-success px-4 text-[13px] font-medium text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#15803D] dark:hover:bg-[#166534]"
        >
          {saving && <LoaderCircle className="size-3.5 animate-spin" aria-hidden />}
          {saving ? 'Recording…' : 'Confirm payment recorded'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-[40px] cursor-pointer rounded-lg bg-card px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
