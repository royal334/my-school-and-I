'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Unit } from './types';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { verifyButtonClass } from './classes';
import { VerificationForm } from './verification-form';

export function VerificationSection({ unit, onVerified }: { unit: Unit; onVerified: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const isOverdue = unit.verification_due_at && new Date(unit.verification_due_at) < new Date();

  if (!showForm) {
    return (
      <Card>
        <SectionTitle>Verification</SectionTitle>
        <div className="mb-3 flex flex-col gap-1.5">
          {unit.last_verified_at ? (
            <>
              <p className="text-[13px] font-medium text-success">
                Last verified: {formatDistanceToNow(new Date(unit.last_verified_at), { addSuffix: true })}
              </p>
              {unit.verification_due_at && (
                <p className={cn('text-xs', isOverdue ? 'text-error' : 'text-stone-500 dark:text-stone-300')}>
                  Next due: {format(new Date(unit.verification_due_at), 'MMM d, yyyy')}
                </p>
              )}
            </>
          ) : (
            <p className="text-[13px] text-stone-500 dark:text-stone-300">
              Not yet verified. Run physical inspection then complete verification.
            </p>
          )}
        </div>
        <button onClick={() => setShowForm(true)} className={verifyButtonClass}>
          {unit.last_verified_at ? '🔄 Run re-verification' : '✓ Run first verification'}
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-3.5 flex items-center justify-between">
        <SectionTitle>Verification form</SectionTitle>
        <button
          onClick={() => setShowForm(false)}
          className="cursor-pointer border-none bg-transparent text-base text-stone-500 dark:text-stone-300"
        >
          ✕
        </button>
      </div>
      <VerificationForm
        unit={unit}
        onComplete={() => {
          setShowForm(false);
          onVerified();
        }}
      />
    </Card>
  );
}