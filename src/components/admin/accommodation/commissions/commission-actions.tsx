'use client';

import { AlertTriangle, CheckCircle2, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { availableActions } from './constants';
import type { CommissionAction } from './types';

const ACTION_CLASS =
  'flex min-h-[34px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

interface CommissionActionsProps {
  status: string;
  /** Name of the action currently in flight, if any. */
  acting: CommissionAction | null;
  onConfirm: () => void;
  onDispute: () => void;
  onRecordPayment: () => void;
}

export function CommissionActions({
  status,
  acting,
  onConfirm,
  onDispute,
  onRecordPayment,
}: CommissionActionsProps) {
  const actions = availableActions(status);
  const busy = acting !== null;

  if (actions.length === 0) return null;

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      {actions.includes('confirm') && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={cn(
            ACTION_CLASS,
            'border-info/25 bg-info-bg text-info-text hover:bg-info/15',
          )}
        >
          {acting === 'confirm' ? (
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <CheckCircle2 className="size-3.5" aria-hidden />
          )}
          Confirm
        </button>
      )}

      {actions.includes('record_payment') && (
        <button
          type="button"
          onClick={onRecordPayment}
          disabled={busy}
          className={cn(
            ACTION_CLASS,
            'border-success/25 bg-success-bg text-success-text hover:bg-success/15',
          )}
        >
          Record payment
        </button>
      )}

      {actions.includes('dispute') && (
        <button
          type="button"
          onClick={onDispute}
          disabled={busy}
          aria-label="Mark as disputed"
          title="Mark as disputed"
          className={cn(
            ACTION_CLASS,
            'aspect-square px-0 text-muted-foreground hover:border-error/25 hover:bg-error-bg hover:text-error-text',
          )}
        >
          <AlertTriangle className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
}
