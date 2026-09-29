import { formatDistanceToNow } from 'date-fns';
import { MapPin, Eye, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  BOOST_TIERS,
  getConditionLabel,
  getConditionTone,
} from '@/components/marketplace/constants';
import { formatPrice } from '@/components/marketplace/format';
import type { MarketplaceListingDetail } from '@/components/marketplace/types';

export function ListingSummary({ listing }: { listing: MarketplaceListingDetail }) {
  const boostLabel = listing.active_boost
    ? BOOST_TIERS.find((tier) => tier.key === listing.active_boost?.boost_tier)?.label
    : null;

  return (
    <div className="mb-3 rounded-xl border border-border bg-card p-4">
      {/* Badges */}
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        <Badge className={getConditionTone(listing.condition)}>
          {getConditionLabel(listing.condition)}
        </Badge>
        {listing.is_urgent && (
          <Badge className="bg-error-bg text-error-text">⚡ Urgent sale</Badge>
        )}
        {listing.active_boost && boostLabel && (
          <Badge className="bg-accent-500/10 text-accent-700 dark:bg-accent-500/15 dark:text-accent-400">
            🔥 {boostLabel}
          </Badge>
        )}
      </div>

      <h2 className="mb-2.5 font-semibold leading-tight text-foreground">
        {listing.title}
      </h2>

      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground">
          {formatPrice(listing.price)}
        </span>
        {listing.negotiable && (
          <span className="text-xs font-medium text-primary">Negotiable</span>
        )}
      </div>

      <p className="mb-1 text-xs text-muted-foreground">
        {listing.location && (
          <>
            <MapPin className="mr-1 inline size-3" />
            {listing.location} ·{' '}
          </>
        )}
        Listed {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
      </p>
      <p className="text-xs text-muted-foreground">
        <Eye className="mr-1 inline size-3" /> {listing.views} views ·{' '}
        <Heart className="mr-1 inline size-3" /> {listing.saves_count} saves
      </p>

      {listing.description && (
        <div className="mt-3.5 border-t border-border pt-3.5">
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {listing.description}
          </p>
        </div>
      )}
    </div>
  );
}