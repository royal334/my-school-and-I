import { formatPrice } from '@/components/marketplace/format';
import type { BoostTier } from '@/components/marketplace/types';

interface BoostSummaryProps {
  listingTitle: string;
  tier: BoostTier;
}

export function BoostSummary({ listingTitle, tier }: BoostSummaryProps) {
  return (
    <div className="mb-4 rounded-xl border border-border bg-card p-4">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-primary">
        Summary
      </p>

      <dl className="space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-[13px] text-muted-foreground">Listing</dt>
          <dd className="truncate text-right text-[13px] font-medium text-foreground">
            {listingTitle}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-[13px] text-muted-foreground">Boost tier</dt>
          <dd className="text-right text-[13px] font-medium text-foreground">
            {tier.emoji} {tier.label}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-[13px] text-muted-foreground">Duration</dt>
          <dd className="text-right text-[13px] font-medium text-foreground">
            {tier.duration}
          </dd>
        </div>
      </dl>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2.5">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="text-base font-bold text-foreground">{formatPrice(tier.price)}</span>
      </div>
    </div>
  );
}