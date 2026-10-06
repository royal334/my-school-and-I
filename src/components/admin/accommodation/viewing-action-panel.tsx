'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { SectionTitle } from './section-title';
import { formatPrice } from './utils';
import type { ViewingAction, ViewingDetail } from './types';

const inputClass = cn(
  'w-full rounded-lg border border-[#C8E8DA] bg-white px-3.5 py-2.5 text-sm outline-none transition-colors',
  'placeholder:text-stone-400 focus:border-primary-500 dark:border-white/10 dark:bg-transparent dark:text-white',
);
const textareaClass = cn(inputClass, 'resize-y');
const primaryBtnClass =
  'min-h-10 flex-1 cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-60';
const successBtnClass =
  'min-h-10 flex-1 cursor-pointer rounded-lg bg-success px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-60';
const secondaryBtnClass =
  'min-h-10 cursor-pointer rounded-lg bg-primary-50 px-4 py-2.5 text-[13px] font-medium text-primary-600 disabled:opacity-60 dark:bg-white/10 dark:text-white';

export function ViewingActionPanel({
  viewing,
  onUpdate,
}: {
  viewing: ViewingDetail;
  onUpdate: (updated: ViewingDetail) => void;
}) {
  const router = useRouter();
  const [action, setAction] = useState<ViewingAction | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [adminNotes, setAdminNotes] = useState(viewing.admin_notes || '');
  const [landlordRentAmount, setLandlordRentAmount] = useState(
    viewing.unit.price?.toString() || '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function updateViewing(updates: Record<string, unknown>) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/accommodation/viewings/${viewing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate({ ...viewing, ...data.viewing });
      setAction(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  }

  async function createTransaction() {
    const rentAmount = Number(landlordRentAmount);
    if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
      setError('Enter a valid annual rent amount greater than zero.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/accommodation/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: viewing.unit.id,
          property_id: viewing.unit.property.id,
          student_id: viewing.student_id,
          viewing_id: viewing.id,
          landlord_rent_amount: rentAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!data.referral) {
        toast.warning(
          'Transaction recorded, but this server response did not include referral status. Refresh the page and retry to check or create the referral.',
          { duration: 7000, position: 'top-center' },
        );
      } else if (data.referral.created || data.referral.issue === null) {
        toast.success(data.referral.created
          ? 'Transaction created, unit rented, and referral created.'
          : 'Transaction is recorded and its referral already exists.', {
          duration: 5000,
          position: 'top-center',
        });
      } else {
        const message = data.referral?.issue === 'no_matching_submission'
          ? 'Transaction recorded, but no approved submission is linked to this unit.'
          : data.referral?.issue === 'missing_submitter'
            ? 'Transaction recorded, but the approved submission has no submitter.'
            : data.referral?.issue === 'agent_sourced'
              ? data.agent_commission?.created
                ? 'Transaction recorded and agent commission created.'
                : data.agent_commission?.exists
                  ? 'Transaction recorded; the agent commission already exists.'
                  : `Transaction recorded, but agent commission was not created: ${data.agent_commission?.error || data.agent_commission?.issue || 'check the server logs.'}`
              : `Transaction recorded, but referral was not created. Reason: ${data.referral.issue || 'unknown'}.${data.referral.error ? ` ${data.referral.error}` : ''}`;
        toast.warning(message, {
          duration: 7000,
          position: 'top-center',
        });
      }
      router.push('/admin/accommodation');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  }

  const actionButtonClass =
    'cursor-pointer rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium';

  return (
    <Card>
      <SectionTitle>Actions</SectionTitle>

      {!action && (
        <div className="mt-2 flex flex-col gap-2">
          {viewing.status === 'pending' && (
            <button
              onClick={() => setAction('schedule')}
              className={cn(actionButtonClass, 'border-[#1A5C8A]/20 bg-[#1A5C8A]/10 text-[#1A5C8A]')}
            >
              📅 Schedule viewing
            </button>
          )}

          {viewing.status === 'scheduled' && (
            <button
              onClick={() => updateViewing({ status: 'completed', admin_notes: adminNotes })}
              className={cn(actionButtonClass, 'border-success/20 bg-success/10 text-success')}
            >
              ✓ Mark viewing as completed
            </button>
          )}

          {viewing.status === 'completed' && (
            <button
              onClick={() => setAction('transaction')}
              className={cn(
                actionButtonClass,
                'border-accent-500/30 bg-accent-500/10 text-[#A07800] dark:text-accent-300',
              )}
            >
              🏠 Student interested — create transaction
            </button>
          )}

          {['pending', 'scheduled'].includes(viewing.status) && (
            <button
              onClick={() => updateViewing({ status: 'cancelled' })}
              className={cn(actionButtonClass, 'border-error/20 bg-error/10 text-error')}
            >
              ✕ Cancel viewing
            </button>
          )}

          {viewing.status === 'completed' && (
            <p className="pt-1 text-center text-xs text-stone-500 dark:text-stone-300">
              If student is not interested, no further action needed.
            </p>
          )}
        </div>
      )}

      {action === 'schedule' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <p className="text-[13px] text-primary-600 dark:text-white">Confirm the viewing date and time.</p>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="Notes for student (optional — e.g. Contact caretaker on arrival)"
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={2}
            className={textareaClass}
          />
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateViewing({
                  status: 'scheduled',
                  scheduled_date: scheduledDate || null,
                  admin_notes: adminNotes,
                })
              }
              disabled={saving}
              className={primaryBtnClass}
            >
              {saving ? 'Saving…' : 'Confirm schedule'}
            </button>
            <button onClick={() => setAction(null)} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {action === 'transaction' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <p className="text-[13px] leading-relaxed text-primary-600 dark:text-white">
            Create a transaction record. This will mark the unit as rented and trigger the referral reward process.
          </p>
          <p className="text-[13px] font-medium text-primary-500 dark:text-primary-300">
            Unit: {viewing.unit.property.name} · {viewing.unit.unit_number || viewing.unit.room_type}
            {viewing.unit.price && ` · ${formatPrice(viewing.unit.price)}/yr`}
          </p>
          <label className="flex flex-col gap-1 text-[12px] font-medium text-primary-600 dark:text-white">
            Agreed annual rent paid to landlord (NGN)
            <input
              type="number"
              min="1"
              step="1"
              required
              value={landlordRentAmount}
              onChange={e => setLandlordRentAmount(e.target.value)}
              className={inputClass}
            />
          </label>
          {error && <p className="text-[13px] text-error">{error}</p>}
          <div className="flex gap-2">
            <button onClick={createTransaction} disabled={saving} className={successBtnClass}>
              {saving ? 'Creating…' : 'Confirm transaction'}
            </button>
            <button onClick={() => setAction(null)} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && !action && <p className="mt-2 text-[13px] text-error">{error}</p>}
    </Card>
  );
}