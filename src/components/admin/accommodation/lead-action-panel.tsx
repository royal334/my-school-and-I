'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card } from './card';
import { SectionTitle } from './section-title';
import type { LeadAction, LeadDetail } from './types';

const inputClass = cn(
  'w-full rounded-lg border border-[#C8E8DA] bg-white px-3.5 py-2.5 text-sm outline-none transition-colors',
  'placeholder:text-stone-400 focus:border-primary-500 dark:border-white/10 dark:bg-transparent dark:text-white',
);
const textareaClass = cn(inputClass, 'resize-y');
const primaryBtnClass =
  'min-h-10 flex-1 cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-60';
const dangerBtnClass =
  'min-h-10 flex-1 cursor-pointer rounded-lg bg-error px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-60';
const secondaryBtnClass =
  'min-h-10 cursor-pointer rounded-lg bg-primary-50 px-4 py-2.5 text-[13px] font-medium text-primary-600 disabled:opacity-60 dark:bg-white/10 dark:text-white';

const ACTION_BUTTONS: { action: LeadAction; label: string; className: string }[] = [
  {
    action: 'reviewing',
    label: '📞 Mark as reviewing (contacting owner)',
    className: 'bg-[#1A5C8A]/10 border border-[#1A5C8A]/20 text-[#1A5C8A]',
  },
  {
    action: 'create_property',
    label: '🏠 Create property + unit (after inspection)',
    className: 'bg-success/10 border border-success/20 text-success',
  },
  {
    action: 'duplicate',
    label: '🔁 Mark as duplicate',
    className: 'bg-stone-500/10 border border-stone-400/30 text-stone-500',
  },
  {
    action: 'rejected',
    label: '❌ Reject submission',
    className: 'bg-error/10 border border-error/20 text-error',
  },
];

export function LeadActionPanel({
  lead,
  onUpdate,
}: {
  lead: LeadDetail;
  onUpdate: (updated: LeadDetail) => void;
}) {
  const [action, setAction] = useState<LeadAction | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState(lead.admin_notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [propName, setPropName] = useState(lead.property_name);
  const [propArea, setPropArea] = useState(lead.area);
  const [propStreet, setPropStreet] = useState(lead.street || '');
  const [propLandmark, setPropLandmark] = useState(lead.landmark || '');
  const [propLandlordName, setPropLandlordName] = useState(lead.landlord_name || '');
  const [propLandlordPhone, setPropLandlordPhone] = useState(lead.landlord_phone || '');
  const [unitNumber, setUnitNumber] = useState(lead.unit_number || '');
  const [unitRoomType, setUnitRoomType] = useState(lead.room_type || '');
  const [unitPrice, setUnitPrice] = useState(lead.expected_price?.toString() || '');
  const [unitWater, setUnitWater] = useState(lead.has_water ?? false);
  const [unitElec, setUnitElec] = useState(lead.has_electricity ?? false);
  const [unitSec, setUnitSec] = useState(lead.has_security ?? false);

  const availableActions = lead.status === 'pending'
    ? ACTION_BUTTONS.filter(({ action: candidate }) => candidate !== 'create_property')
    : lead.status === 'reviewing'
      ? ACTION_BUTTONS.filter(({ action: candidate }) => candidate !== 'reviewing')
      : [];

  async function updateStatus(status: 'reviewing' | 'duplicate' | 'rejected') {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/accommodation/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: status === 'duplicate' ? 'mark_duplicate' : 'update_status',
          status: status === 'duplicate' ? undefined : status,
          admin_notes: adminNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate({ ...lead, ...data.lead });
      setAction(null);
      setConfirmationOpen(false);
      toast.success({
        reviewing: 'Submission marked as reviewing.',
        duplicate: 'Submission marked as duplicate.',
        rejected: 'Submission rejected.',
      }[status]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
      setConfirmationOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function createPropertyAndUnit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/accommodation/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: {
            name: propName,
            area: propArea,
            street: propStreet || null,
            landmark: propLandmark || null,
            landlord_name: propLandlordName || null,
            landlord_phone: propLandlordPhone || null,
          },
          unit: {
            unit_number: unitNumber || null,
            room_type: unitRoomType,
            price: unitPrice ? parseFloat(unitPrice) : null,
            has_water: unitWater,
            has_electricity: unitElec,
            has_security: unitSec,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.property?.id && data.unit?.id) {
        const linkRes = await fetch(`/api/admin/accommodation/leads/${lead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'link_property',
            matched_property_id: data.property.id,
            matched_unit_id: data.unit.id,
            admin_notes: adminNotes,
          }),
        });
        if (!linkRes.ok) {
          const linkData = await linkRes.json();
          throw new Error(linkData.error || 'Failed to link property to submission');
        }

        const verifyRes = await fetch(`/api/admin/accommodation/verify/${data.unit.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: data.property.id,
            verification_result: 'approved',
            location_confirmed: true,
            owner_confirmed: true,
            price_confirmed: true,
            availability_confirmed: true,
            photos_confirmed: false,
            facilities_confirmed: true,
            notes: 'Verified on creation via lead approval.',
          }),
        });
        if (!verifyRes.ok) {
          const verifyData = await verifyRes.json();
          throw new Error(verifyData.error || 'Failed to verify the new unit');
        }

        const refreshed = await fetch(`/api/admin/accommodation/leads/${lead.id}`).then(r => r.json());
        if (refreshed.lead) onUpdate({ ...lead, ...refreshed.lead });
      }

      toast.success(`Property "${propName}" created, verified and listed on CampusHub.`);
      setAction(null);
      setConfirmationOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
      setConfirmationOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function requestConfirmation() {
    setError('');
    setConfirmationOpen(true);
  }

  function confirmAction() {
    if (action === 'reviewing' || action === 'duplicate' || action === 'rejected') {
      void updateStatus(action);
    } else if (action === 'create_property') {
      void createPropertyAndUnit();
    }
  }

  const confirmationDetails = {
    reviewing: {
      title: 'Mark as reviewing?',
      description: 'This submission will move to review. You can create a listing after inspection.',
      confirmLabel: 'Mark as reviewing',
    },
    create_property: {
      title: 'Create and list this property?',
      description: 'This will create the property, verify the unit, and make it available on CampusHub.',
      confirmLabel: 'Create listing',
    },
    duplicate: {
      title: 'Mark as duplicate?',
      description: 'This submission will be marked as a duplicate and cannot be listed.',
      confirmLabel: 'Mark duplicate',
    },
    rejected: {
      title: 'Reject this submission?',
      description: 'This submission will be rejected and no further actions will be available.',
      confirmLabel: 'Reject submission',
    },
  } as const;
  const confirmation = action ? confirmationDetails[action] : null;

  return (
    <Card>
      <SectionTitle>Actions</SectionTitle>

      {!action && availableActions.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {availableActions.map(btn => (
            <button
              key={btn.action}
              onClick={() => {
                setError('');
                setAction(btn.action);
              }}
              className={cn(
                'cursor-pointer rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium',
                btn.className,
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {!action && availableActions.length === 0 && (
        <p className="mt-2 text-[13px] text-muted-foreground">No further actions are available for this submission.</p>
      )}

      {action === 'reviewing' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <p className="text-[13px] text-primary-600 dark:text-white">
            Mark as under review and add optional notes.
          </p>
          <textarea
            placeholder="Notes (e.g. Called landlord, inspection booked for Friday)"
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={3}
            className={textareaClass}
          />
          <div className="flex gap-2">
            <button onClick={requestConfirmation} disabled={loading} className={primaryBtnClass}>
              Continue
            </button>
            <button onClick={() => setAction(null)} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {action === 'rejected' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <p className="text-[13px] text-primary-600 dark:text-white">
            Add a note to explain why (optional, shown to student).
          </p>
          <textarea
            placeholder="Reason for rejection (optional)"
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={2}
            className={textareaClass}
          />
          <div className="flex gap-2">
            <button onClick={requestConfirmation} disabled={loading} className={dangerBtnClass}>
              Continue to confirmation
            </button>
            <button onClick={() => setAction(null)} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {action === 'duplicate' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <textarea
            placeholder="Note (optional)"
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={2}
            className={textareaClass}
          />
          <div className="flex gap-2">
            <button onClick={requestConfirmation} disabled={loading} className={secondaryBtnClass}>
              Continue to confirmation
            </button>
            <button onClick={() => setAction(null)} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {action === 'create_property' && (
        <div className="mt-2 flex flex-col gap-3">
          <p className="text-[13px] leading-relaxed text-primary-600 dark:text-white">
            Create the property record from this submission. You&apos;ll verify the unit separately.
          </p>

          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-500 dark:text-primary-300">
            Property
          </p>
          <input className={inputClass} placeholder="Property name *" value={propName} onChange={e => setPropName(e.target.value)} />
          <input className={inputClass} placeholder="Area *" value={propArea} onChange={e => setPropArea(e.target.value)} />
          <input className={inputClass} placeholder="Street" value={propStreet} onChange={e => setPropStreet(e.target.value)} />
          <input className={inputClass} placeholder="Landmark" value={propLandmark} onChange={e => setPropLandmark(e.target.value)} />
          <input className={inputClass} placeholder="Landlord name" value={propLandlordName} onChange={e => setPropLandlordName(e.target.value)} />
          <input className={inputClass} placeholder="Landlord phone" value={propLandlordPhone} onChange={e => setPropLandlordPhone(e.target.value)} />

          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-500 dark:text-primary-300">
            Unit / Room
          </p>
          <input className={inputClass} placeholder="Unit number (e.g. Room 102)" value={unitNumber} onChange={e => setUnitNumber(e.target.value)} />
          <input className={inputClass} placeholder="Room type *" value={unitRoomType} onChange={e => setUnitRoomType(e.target.value)} />
          <input className={inputClass} type="number" placeholder="Price (₦/yr)" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />

          <div className="flex gap-4">
            {[
              { label: 'Water', val: unitWater, set: setUnitWater },
              { label: 'Electricity', val: unitElec, set: setUnitElec },
              { label: 'Security', val: unitSec, set: setUnitSec },
            ].map(({ label, val, set }) => (
              <label key={label} className="flex cursor-pointer items-center gap-1.5 text-[13px] text-primary-600 dark:text-white">
                <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          {error && <p className="text-[13px] text-error">{error}</p>}

          <div className="flex gap-2">
            <button onClick={requestConfirmation} disabled={loading} className={primaryBtnClass}>
              Review and confirm listing
            </button>
            <button onClick={() => setAction(null)} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && !action && <p className="mt-2 text-[13px] text-error">{error}</p>}

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmation?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <button
              type="button"
              onClick={confirmAction}
              disabled={loading}
              className={cn(
                action === 'rejected' ? dangerBtnClass : primaryBtnClass,
                'min-h-9 flex-none',
              )}
            >
              {loading ? 'Saving…' : confirmation?.confirmLabel}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}