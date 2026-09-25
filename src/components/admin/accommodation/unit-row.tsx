'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import type { Unit } from './types';
import Link from 'next/link';

export function UnitRow({
  unit,
  formatPrice,
  onVerified,
}: {
  unit: Unit;
  formatPrice: (p: number) => string;
  onVerified: () => void;
}) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const verificationOverdue = !!unit.verification_due_at && new Date(unit.verification_due_at) < new Date();
  const expired = unit.availability_status.includes('expir');
  const canBeListed = unit.availability_status !== 'available' && unit.availability_status !== 'rented';


  async function verifyAndList() {
    setVerifying(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/accommodation/verify/${unit.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: unit.property.id,
          verification_result: 'approved',
          location_confirmed: true,
          owner_confirmed: true,
          price_confirmed: true,
          availability_confirmed: true,
          photos_confirmed: false,
          facilities_confirmed: true,
          notes: 'Verified from admin listings tab.',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify unit');
      onVerified();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Link href= {`/admin/accommodation/units/${unit.id}`}>
      <div
        className={cn(
          'flex items-center justify-between gap-2.5 rounded-[10px] border bg-white p-3 dark:bg-card',
          expired
            ? 'border-[#C44B2A]/30 dark:border-[#C44B2A]/40'
            : 'border-[#D6E5DF] dark:border-white/10',
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 truncate text-sm font-medium text-primary-600 dark:text-white">
            {unit.property.name}
            {unit.unit_number && (
              <span className="font-normal text-primary-500 dark:text-primary-300"> · {unit.unit_number}</span>
            )}
          </p>
          <p className="mb-0.5 text-xs text-stone-500 dark:text-stone-300">
            {unit.room_type} · {unit.price ? formatPrice(unit.price) + '/yr' : 'No price set'}
          </p>
          {unit.last_verified_at && (
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Verified {formatDistanceToNow(new Date(unit.last_verified_at), { addSuffix: true })}
              {unit.verification_due_at && (
                <span className={verificationOverdue ? 'text-error' : ''}>
                  {' · Due '}
                  {format(new Date(unit.verification_due_at), 'MMM d')}
                </span>
              )}
            </p>
          )}
          {error && <p className="mt-1 text-[11px] text-error">{error}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={unit.availability_status} />
          {canBeListed && (
            <button
              onClick={verifyAndList}
              disabled={verifying}
              className={cn(
                'whitespace-nowrap rounded-md border-none bg-primary-600 px-2.5 py-1.5 text-xs font-medium text-white',
                verifying ? 'cursor-default opacity-60' : 'cursor-pointer',
              )}
            >
              {verifying ? 'Verifying…' : 'Verify & list'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}