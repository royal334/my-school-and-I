'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../card';
import { cn } from '@/lib/utils';
import { CommissionActions } from './commission-actions';
import { CommissionAmountBlock } from './commission-amount-block';
import { CommissionPaymentForm } from './commission-payment-form';
import { CommissionPaymentInfo } from './commission-payment-info';
import { commissionEndpoint } from './constants';
import { getCommissionStatusMeta, type AdminCommission, type CommissionAction } from './types';

interface CommissionRowProps {
  commission: AdminCommission;
  onUpdate: (updated: AdminCommission) => void;
}

const SUCCESS_MESSAGES: Record<CommissionAction, string> = {
  confirm: 'Commission confirmed.',
  record_payment: 'Payment recorded.',
  dispute: 'Commission marked as disputed.',
};

export function CommissionRow({ commission, onUpdate }: CommissionRowProps) {
  const [acting, setActing] = useState<CommissionAction | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState('');

  const meta = getCommissionStatusMeta(commission.status);
  const StatusIcon = meta.icon;

  async function runAction(
    action: CommissionAction,
    values?: { paymentReference: string; paymentNotes: string },
  ) {
    setActing(action);
    setError('');

    try {
      const res = await fetch(commissionEndpoint(commission.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          payment_reference: values?.paymentReference.trim() || null,
          payment_notes: values?.paymentNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update the commission');

      onUpdate({ ...commission, ...data.commission });
      setShowPaymentForm(false);
      toast.success(SUCCESS_MESSAGES[action], { position: 'top-center' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setActing(null);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b px-4 py-2',
          meta.bg,
          meta.border,
        )}
      >
        <span className={cn('flex items-center gap-1.5 text-xs font-medium', meta.color)}>
          <StatusIcon className="size-3.5 shrink-0" aria-hidden />
          {meta.label}
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(commission.created_at), { addSuffix: true })}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-[15px] tracking-tight text-primary-700 dark:text-white">
          {commission.agent?.display_name || 'Unknown agent'}
        </h3>

        {commission.agent?.phone_number && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3 shrink-0" aria-hidden />
            {commission.agent.phone_number}
          </p>
        )}

        {commission.unit && (
          <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
            <span className="min-w-0">
              {[
                commission.unit.property?.name,
                commission.unit.property?.area,
                commission.unit.unit_number,
              ]
                .filter(Boolean)
                .join(' · ') || commission.unit.room_type}
            </span>
          </p>
        )}

        <div className="mt-3 flex items-start justify-between gap-3">
          <CommissionAmountBlock commission={commission} colorClass={meta.color} />

          <CommissionActions
            status={commission.status}
            acting={acting}
            onConfirm={() => runAction('confirm')}
            onDispute={() => runAction('dispute')}
            onRecordPayment={() => {
              setError('');
              setShowPaymentForm(open => !open);
            }}
          />
        </div>

        <CommissionPaymentInfo commission={commission} />

        {showPaymentForm && commission.status === 'confirmed' && (
          <CommissionPaymentForm
            commission={commission}
            saving={acting === 'record_payment'}
            error={error}
            onSubmit={values => runAction('record_payment', values)}
            onCancel={() => {
              setError('');
              setShowPaymentForm(false);
            }}
          />
        )}

        {!showPaymentForm && error && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-error-text">
            <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}
