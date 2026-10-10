import { Suspense } from 'react';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { MarketplaceFeed } from '@/components/marketplace/marketplace-feed';
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header';
import { LiabilityNotice } from '@/components/legal/liability-notice';
import { ListingSkeletonGrid } from '@/components/marketplace/listing-skeleton';
import { marketplaceQueryString } from '@/components/marketplace/filters';
import type { MarketplaceFilters as MarketplaceFiltersType } from '@/components/marketplace/types';

export function MarketplaceBrowse({
  filters,
  hasListings,
}: {
  filters: MarketplaceFiltersType;
  hasListings: boolean;
}) {
  return (
    <div className="space-y-4 overflow-x-hidden">
      <MarketplaceHeader hasListings={hasListings} />
      <LiabilityNotice />
      <MarketplaceFilters />

      <Suspense key={marketplaceQueryString(filters)} fallback={<ListingSkeletonGrid />}>
        <MarketplaceFeed filters={filters} />
      </Suspense>
    </div>
  );
}
