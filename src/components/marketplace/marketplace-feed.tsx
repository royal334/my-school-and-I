import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getMarketplaceFeed } from '@/utils/supabase/queries/marketplace';
import { hasActiveFilters } from '@/components/marketplace/filters';
import { PromotedSection } from '@/components/marketplace/promoted-section';
import { ResultsBar } from '@/components/marketplace/results-bar';
import { ListingGrid } from '@/components/marketplace/listing-grid';
import { ListingEmptyState } from '@/components/marketplace/listing-empty-state';
import type { MarketplaceFilters } from '@/components/marketplace/types';

/**
 * Data-dependent part of the browse page: promoted strip plus the filtered
 * feed. Kept async behind a Suspense boundary so the header and filter controls
 * render without waiting on it. Like the original feed, promoted listings are
 * always shown and ignore the active filters.
 */
export async function MarketplaceFeed({ filters }: { filters: MarketplaceFilters }) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const feed = user
    ? await getMarketplaceFeed(supabase, user.id, filters)
    : { promoted: [], listings: [], total: 0 };

  const filtered = hasActiveFilters(filters) || Boolean(filters.search);

  return (
    <div>
      <PromotedSection listings={feed.promoted} />

      <ResultsBar total={feed.total} />

      {feed.listings.length === 0 ? (
        <ListingEmptyState hasFilters={filtered} />
      ) : (
        <ListingGrid listings={feed.listings} />
      )}
    </div>
  );
}
