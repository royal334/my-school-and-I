import { ListingCard } from '@/components/marketplace/listing-card';
import type { MarketplaceListing } from '@/components/marketplace/types';

interface ListingGridProps {
  listings: MarketplaceListing[];
}

export function ListingGrid({ listings }: ListingGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}