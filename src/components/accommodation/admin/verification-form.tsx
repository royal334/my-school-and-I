'use client';

import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Unit } from './types';
import { inputClass, primaryBtnClass } from './classes';
import { VerificationCheckItem } from './verification-check-item';

const sectionLabelClass = 'mb-2 text-xs text-stone-500 dark:text-stone-300';

export function VerificationForm({ unit, onComplete }: { unit: Unit; onComplete: () => void }) {
  const [result, setResult] = useState<'approved' | 'rejected'>('approved');
  const [locationOk, setLocationOk] = useState(false);
  const [ownerOk, setOwnerOk] = useState(false);
  const [priceOk, setPriceOk] = useState(false);
  const [availOk, setAvailOk] = useState(false);
  const [photosOk, setPhotosOk] = useState(false);
  const [facilitiesOk, setFacilitiesOk] = useState(false);
  const [notes, setNotes] = useState('');
  const [days, setDays] = useState('7');

  const [price, setPrice] = useState(unit.price?.toString() || '');
  const [hasWater, setHasWater] = useState(unit.has_water);
  const [hasElec, setHasElec] = useState(unit.has_electricity);
  const [hasSec, setHasSec] = useState(unit.has_security);
  const [hasPark, setHasPark] = useState(unit.has_parking);
  const [isFurnished, setIsFurnished] = useState(unit.is_furnished);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const checkedCount = [locationOk, ownerOk, priceOk, availOk, photosOk, facilitiesOk].filter(Boolean).length;

  async function submit() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/accommodation/verify/${unit.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: unit.property_id,
          verification_result: result,
          location_confirmed: locationOk,
          owner_confirmed: ownerOk,
          price_confirmed: priceOk,
          availability_confirmed: availOk,
          photos_confirmed: photosOk,
          facilities_confirmed: facilitiesOk,
          notes: notes || null,
          verification_days: parseInt(days, 10) || 7,
          unit_updates: {
            price: price ? parseFloat(price) : unit.price,
            has_water: hasWater,
            has_electricity: hasElec,
            has_security: hasSec,
            has_parking: hasPark,
            is_furnished: isFurnished,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-[13px] font-medium text-[#1A3C34] dark:text-white">Verification result</p>
        <div className="flex gap-2">
          {(['approved', 'rejected'] as const).map(r => {
            const active = result === r;
            const approved = r === 'approved';
            return (
              <button
                key={r}
                type="button"
                onClick={() => setResult(r)}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg border py-2.5 text-[13px] capitalize',
                  active
                    ? approved
                      ? 'border-success bg-success/5 font-semibold text-success'
                      : 'border-error bg-error/5 font-semibold text-error'
                    : 'border-[#C8E8DA] bg-white text-[#1A3C34] dark:border-white/10 dark:bg-card dark:text-white',
                )}
              >
                {approved ? '✓ Approve' : '✕ Reject'}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className={sectionLabelClass}>What did you verify? ({checkedCount}/6)</p>
        <div className="flex flex-col gap-1.5">
          <VerificationCheckItem label="📍 Location confirmed" checked={locationOk} onChange={setLocationOk} />
          <VerificationCheckItem label="👤 Owner/caretaker confirmed" checked={ownerOk} onChange={setOwnerOk} />
          <VerificationCheckItem label="💰 Price confirmed" checked={priceOk} onChange={setPriceOk} />
          <VerificationCheckItem label="🗓 Availability confirmed" checked={availOk} onChange={setAvailOk} />
          <VerificationCheckItem label="📸 Photos verified" checked={photosOk} onChange={setPhotosOk} />
          <VerificationCheckItem label="🚰 Facilities checked" checked={facilitiesOk} onChange={setFacilitiesOk} />
        </div>
      </div>

      <div>
        <p className={sectionLabelClass}>Update unit details (after physical inspection)</p>
        <div className="flex flex-col gap-2">
          <input
            className={inputClass}
            type="number"
            placeholder="Confirmed rent (₦/yr)"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {[
              { label: '💧 Water', val: hasWater, set: setHasWater },
              { label: '⚡ Electricity', val: hasElec, set: setHasElec },
              { label: '🔒 Security', val: hasSec, set: setHasSec },
              { label: '🚗 Parking', val: hasPark, set: setHasPark },
              { label: '🛋 Furnished', val: isFurnished, set: setIsFurnished },
            ].map(({ label, val, set }) => (
              <button
                key={label}
                type="button"
                onClick={() => set(!val)}
                className={cn(
                  'cursor-pointer rounded-full border-none px-3.5 py-1.5 text-xs font-medium transition-colors',
                  val ? 'bg-primary-500 text-white' : 'bg-[#E8F5EF] text-[#1A3C34] dark:bg-white/10 dark:text-white',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs text-stone-500 dark:text-stone-300">Verification notes (internal)</p>
        <textarea
          className={cn(inputClass, 'resize-y')}
          placeholder="e.g. Spoke with Mr Okafor, all confirmed. Generator backup present…"
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs text-stone-500 dark:text-stone-300">Next verification in (days)</p>
        <div className="flex gap-2">
          {['3', '7', '14', '30'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={cn(
                'flex-1 cursor-pointer rounded-lg border-none py-2 text-[13px] font-medium transition-colors',
                days === d ? 'bg-[#1A3C34] text-white' : 'bg-[#E8F5EF] text-[#1A3C34] dark:bg-white/10 dark:text-white',
              )}
            >
              {d}d
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-300">
          Next check due: {format(addDays(new Date(), parseInt(days, 10)), 'MMM d, yyyy')}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-error/5 px-3.5 py-2.5 text-[13px] text-error">{error}</p>
      )}

      <button onClick={submit} disabled={saving} className={cn(primaryBtnClass, 'w-full')}>
        {saving ? 'Saving verification…' : `Submit verification (${result})`}
      </button>
    </div>
  );
}