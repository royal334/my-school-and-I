import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  getCategoryEmoji,
  getConditionLabel,
  getConditionTone,
} from '@/components/marketplace/constants';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';
import { formatPrice } from '@/components/marketplace/format';
import { RemoveSavedButton } from '@/components/marketplace/saved/remove-saved-button';
import type { SavedMarketplaceListing } from '@/components/marketplace/types';

interface SavedListingCardProps {
  listing: SavedMarketplaceListing;
}

export function SavedListingCard({ listing }: SavedListingCardProps) {
  const isActive = listing.status === 'active';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-card transition-opacity ${
        isActive ? 'opacity-100' : 'opacity-60'
      }`}
    >
      {!isActive && (
        <Badge className="absolute left-2 top-2 z-10 bg-muted text-muted-foreground uppercase">
          {listing.status}
        </Badge>
      )}

      <RemoveSavedButton listingId={listing.id} />

      <Link href={`${MARKETPLACE_BASE_PATH}/${listing.id}`} className="no-underline">
        <div className="flex h-[130px] w-full items-center justify-center overflow-hidden bg-muted">
          {listing.cover_image ? (
            <img
              src={listing.cover_image.file_path}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl">{getCategoryEmoji(listing.category)}</span>
          )}
        </div>

        <div className="p-3">
          <div className="mb-1 flex items-center gap-1">
            <Badge className={getConditionTone(listing.condition)}>
              {getConditionLabel(listing.condition)}
            </Badge>
            {listing.is_urgent && <Badge className="bg-error-bg text-error-text">⚡</Badge>}
          </div>

          <p className="mb-1 line-clamp-2 text-[13px] font-medium leading-tight text-foreground">
            {listing.title}
          </p>

          <p className="font-semibold text-foreground">
            {formatPrice(listing.price)}
            {listing.negotiable && (
              <span className="ml-1 text-[10px] font-normal text-primary">Neg.</span>
            )}
          </p>
        </div>
      </Link>
    </div>
  );
}