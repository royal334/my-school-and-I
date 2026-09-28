import Link from 'next/link';
import { SaveButton } from '@/components/marketplace/save-button';
import { SellerBadge } from '@/components/marketplace/seller-badge';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/marketplace/star-rating';
import { getCategoryEmoji, getConditionLabel, getConditionTone } from '@/components/marketplace/constants';
import { formatPrice } from '@/components/marketplace/format';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';
import type { MarketplaceListing } from '@/components/marketplace/types';

export function ListingCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <Link href={`${MARKETPLACE_BASE_PATH}/${listing.id}`} className="no-underline">
      <div className="relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
        {/* Image */}
        <div className="relative h-[150px] w-full overflow-hidden bg-muted">
          {listing.cover_image ? (
            <img
              src={listing.cover_image.file_path}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              {getCategoryEmoji(listing.category)}
            </div>
          )}

          {listing.is_urgent && (
            <Badge className="absolute left-2 top-2 bg-error text-white">
              ⚡ Urgent
            </Badge>
          )}

          {listing.is_boosted && (
            <Badge className="absolute right-2 top-2 bg-accent text-accent-950">
              🔥 Promoted
            </Badge>
          )}

          <SaveButton listingId={listing.id} saved={listing.is_saved} variant="floating" />
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Badge className={getConditionTone(listing.condition)}>
              {getConditionLabel(listing.condition)}
            </Badge>
            <span className="text-[10px] text-muted-foreground/60">·</span>
            <SellerBadge type={listing.seller_type} />
          </div>

          <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {listing.title}
          </h3>

          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-[15px] font-semibold text-foreground">
              {formatPrice(listing.price)}
            </span>
            {listing.negotiable && (
              <span className="text-[10px] font-medium text-primary">Negotiable</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="truncate text-[11px] text-muted-foreground">
              {listing.seller_name}
              {listing.location && ` · ${listing.location}`}
            </p>
            <StarRating
              rating={listing.seller_profile?.average_rating ?? null}
              count={listing.seller_profile?.review_count ?? 0}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}