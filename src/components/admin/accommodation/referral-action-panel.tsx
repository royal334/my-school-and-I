'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice } from './utils';
import type { Referral } from './types';

const inputClass = cn(
  'w-full rounded-lg border border-[#C8E8DA] bg-white px-3.5 py-2.5 text-sm outline-none transition-colors',
  'placeholder:text-stone-400 focus:border-primary-500 dark:border-white/10 dark:bg-transparent dark:text-white',
);

const actionButtonClass =
  'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export function ReferralActionPanel({
  referral,
  onUpdate,
  onClose,
}: {
  referral: Referral;
  onUpdate: (updated: Referral) => void;
  onClose: () => void;
}) {
  const [rewardAmount, setRewardAmount] = useState(referral.reward_amount?.toString() || '');
  const [adminNotes, setAdminNotes] = useState(referral.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parsedReward = Number.parseInt(rewardAmount, 10);
  const rewardValue = Number.isNaN(parsedReward) ? null : parsedReward;
  const canPay = rewardValue !== null && rewardValue > 0;

  async function updateReferral(updates: Partial<Referral>) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/accommodation/referrals/${referral.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, admin_notes: adminNotes.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate(data.referral);
      toast.success('Referral updated', { position: 'top-center' });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  }

  const { eligibility_status, payout_status } = referral;

  return (
    <div className="mt-3 flex flex-col gap-2.5 border-t border-[#D6E5DF] pt-3 dark:border-white/10">
      <div>
        <label
          htmlFor={`referral-reward-${referral.id}`}
          className="mb-1 block text-xs text-stone-500 dark:text-stone-300"
        >
          Reward amount (₦)
        </label>
        <input
          id={`referral-reward-${referral.id}`}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="e.g. 15000"
          value={rewardAmount}
          onChange={e => setRewardAmount(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor={`referral-notes-${referral.id}`}
          className="mb-1 block text-xs text-stone-500 dark:text-stone-300"
        >
          Admin notes
        </label>
        <textarea
          id={`referral-notes-${referral.id}`}
          placeholder="Internal notes about this referral…"
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
          rows={2}
          className={cn(inputClass, 'resize-y')}
        />
      </div>

      {error && <p className="text-[13px] text-error">{error}</p>}

      <div className="flex flex-col gap-2">
        {payout_status === 'unpaid' && (
          <button
            type="button"
            onClick={() =>
              updateReferral({ payout_status: 'processing', reward_amount: rewardValue })
            }
            disabled={saving}
            className={cn(actionButtonClass, 'border-info/25 bg-info-bg text-info hover:bg-info/15')}
          >
            <CreditCard className="size-4 shrink-0" aria-hidden />
            Mark as processing payment
          </button>
        )}

        {['unpaid', 'processing'].includes(payout_status) && (
          <button
            type="button"
            onClick={() =>
              updateReferral({
                eligibility_status: 'paid',
                payout_status: 'paid',
                reward_amount: rewardValue,
                paid_at: new Date().toISOString(),
              })
            }
            disabled={saving || !canPay}
            className={cn(
              actionButtonClass,
              canPay
                ? 'border-success/25 bg-success-bg text-success hover:bg-success/15'
                : 'border-[#D6E5DF] bg-muted text-stone-500 dark:border-white/10',
            )}
          >
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            {canPay ? `Confirm reward paid (${formatPrice(rewardValue)})` : 'Confirm reward paid'}
          </button>
        )}

        {['eligible', 'pending'].includes(eligibility_status) && (
          <button
            type="button"
            onClick={() => updateReferral({ eligibility_status: 'disputed' })}
            disabled={saving}
            className={cn(
              actionButtonClass,
              'border-error/25 bg-error-bg text-error hover:bg-error/15',
            )}
          >
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            Mark as disputed
          </button>
        )}
      </div>
    </div>
  );
}
