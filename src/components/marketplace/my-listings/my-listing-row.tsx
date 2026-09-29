import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getCategoryEmoji, getStatusTone } from '@/components/marketplace/constants';
import { formatPrice } from '@/components/marketplace/format';
import { ListingStatusActions } from '@/components/marketplace/my-listings/listing-status-actions';
import type { OwnedListing } from '@/components/marketplace/types';

interface MyListingRowProps {
  listing: OwnedListing;
}

export function MyListingRow({ listing }: MyListingRowProps) {
  const statusConfig = getStatusTone(listing.status);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 bg-muted/50 px-3.5 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={statusConfig.tone}>{statusConfig.label}</Badge>
          {listing.is_boosted && (
            <Badge className="bg-accent-500/10 text-accent-700 dark:bg-accent-500/15 dark:text-accent-400">
              🔥 Boosted
            </Badge>
          )}
          {listing.is_urgent && (
            <Badge className="bg-error-bg text-error-text">⚡ Urgent</Badge>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
        </span>
      </div>

      <div className="flex gap-3 p-3.5">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-2xl">
          {listing.cover_image ? (
            <img
              src={listing.cover_image.file_path}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            getCategoryEmoji(listing.category)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-0.5 truncate text-sm font-medium text-foreground">
            {listing.title}
          </p>
          <p className="mb-1.5 font-semibold text-foreground">
            {formatPrice(listing.price)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            👁 {listing.views} views · ❤️ {listing.saves_count} saves
          </p>
        </div>
      </div>

      <ListingStatusActions listingId={listing.id} status={listing.status} />
    </div>
  );
}