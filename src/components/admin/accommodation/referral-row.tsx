'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, MapPin, Receipt } from 'lucide-react';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { EligibilityBadge, PayoutBadge } from './referral-status-badge';
import { ReferralPayoutCard } from './referral-payout-card';
import { ReferralRewardRow } from './referral-reward-row';
import { ReferralActionPanel } from './referral-action-panel';
import { formatPrice } from './utils';
import type { Referral } from './types';

const MANAGABLE = ['eligible', 'pending'];

export function ReferralRow({
  referral,
  onUpdate,
}: {
  referral: Referral;
  onUpdate: (updated: Referral) => void;
}) {
  const [managing, setManaging] = useState(false);
  const { unit, transaction, referrer } = referral;
  const manageable = MANAGABLE.includes(referral.eligibility_status);

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-2 border-b border-[#D6E5DF] bg-primary-50/50 px-4 py-2.5 dark:border-white/10 dark:bg-primary-500/10">
        <EligibilityBadge status={referral.eligibility_status} />
        <PayoutBadge status={referral.payout_status} />
      </div>

      <div className="p-4">
        <h3 className="font-display text-[15px] tracking-tight text-primary-700 dark:text-white">
          {referrer?.full_name || 'Unknown student'}
        </h3>

        {unit && (
          <p className="mt-1 flex items-start gap-1.5 text-xs text-stone-500 dark:text-stone-300">
            <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden />
            <span className="min-w-0">
              {unit.property.name} · {unit.unit_number || unit.room_type}
            </span>
          </p>
        )}

        {transaction?.rent_amount && (
          <p className="mt-1 flex items-start gap-1.5 text-xs text-stone-500 dark:text-stone-300">
            <Receipt className="mt-0.5 size-3 shrink-0" aria-hidden />
            <span>
              Rent {formatPrice(transaction.rent_amount)}/yr
              {transaction.completed_at && ` · paid ${format(new Date(transaction.completed_at), 'MMM d, yyyy')}`}
            </span>
          </p>
        )}

        <ReferralPayoutCard details={referral.payout_details} />
        <ReferralRewardRow rewardAmount={referral.reward_amount} paidAt={referral.paid_at} />

        {referral.admin_notes && !managing && (
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-stone-600 dark:bg-white/5 dark:text-stone-300">
            {referral.admin_notes}
          </p>
        )}

        {manageable && (
          <button
            type="button"
            onClick={() => setManaging(open => !open)}
            aria-expanded={managing}
            className="mt-3 flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-200"
          >
            <ChevronDown
              className={cn('size-3.5 transition-transform', managing && 'rotate-180')}
              aria-hidden
            />
            {managing ? 'Hide actions' : 'Manage reward'}
          </button>
        )}

        {managing && (
          <ReferralActionPanel
            referral={referral}
            onUpdate={updated => onUpdate({ ...referral, ...updated })}
            onClose={() => setManaging(false)}
          />
        )}
      </div>
    </Card>
  );
}
