'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BadgeCheck, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommissionBreakdown } from './commission-breakdown';
import { PaymentRecordedInfo } from './payment-recorded-info';
import { getCommissionStatusMeta, type CommissionRecord } from './types';
import { formatNaira, formatRatePercent } from './format';

interface CommissionCardProps {
  record: CommissionRecord;
}

export function CommissionCard({ record }: CommissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCommissionStatusMeta(record.status);
  const ratePercent = formatRatePercent(record.referrer_rate_bps);
  const property = record.unit?.property;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className={cn('flex items-center justify-between gap-2 px-3.5 py-2', meta.bg)}>
        <span className={cn('text-xs font-medium', meta.color)}>{meta.label}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
        </span>
      </div>

      <div className="p-3.5">
        {record.unit && (
          <>
            <p className="text-sm font-medium text-foreground">
              {property?.name || 'Unknown property'}
              {record.unit.unit_number && ` · ${record.unit.unit_number}`}
            </p>
            {(property?.area || record.unit.room_type) && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                {property?.area && <MapPin className="size-3 shrink-0" aria-hidden />}
                {[property?.area, record.unit.room_type].filter(Boolean).join(' · ')}
              </p>
            )}
          </>
        )}

        <div
          className={cn(
            'mt-3 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5',
            meta.bg,
          )}
        >
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Your commission ({ratePercent}%)</p>
            <p className={cn('font-mono text-xl font-bold', meta.color)}>
              {formatNaira(record.agent_commission_minor)}
            </p>
          </div>
          {record.status === 'payment_recorded' && (
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/15"
              aria-hidden
            >
              <BadgeCheck className="size-4 text-success" />
            </span>
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{meta.description}</p>

        <PaymentRecordedInfo record={record} />

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
        >
          {expanded ? 'Hide breakdown' : 'Show calculation'}
          {expanded ? (
            <ChevronUp className="size-3.5" aria-hidden />
          ) : (
            <ChevronDown className="size-3.5" aria-hidden />
          )}
        </button>

        {expanded && <CommissionBreakdown record={record} accentClass={meta.color} />}
      </div>
    </article>
  );
}
