import { Banknote, CircleSlash } from 'lucide-react';
import type { ReferralPayoutDetails } from './types';

export function ReferralPayoutCard({ details }: { details: ReferralPayoutDetails | null }) {
  return (
    <div className="mt-3 rounded-lg border border-primary-200 bg-primary-50/70 p-3 dark:border-primary-500/25 dark:bg-primary-500/10">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-600 dark:text-primary-300">
        <Banknote className="size-3.5 shrink-0" aria-hidden />
        Payout account
      </p>

      {details ? (
        <dl className="space-y-0.5 text-[13px] leading-relaxed">
          <Row label="Bank" value={details.bank_name} />
          <Row label="Account name" value={details.account_name} />
          <Row label="Account number" value={details.account_number} mono />
        </dl>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <CircleSlash className="size-3.5 shrink-0" aria-hidden />
          Referrer has not added bank details.
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-stone-500 dark:text-stone-400">{label}</dt>
      <dd
        className={
          mono
            ? 'text-right font-mono text-[12px] font-medium text-primary-700 dark:text-primary-100'
            : 'text-right font-medium text-primary-700 dark:text-primary-100'
        }
      >
        {value}
      </dd>
    </div>
  );
}
