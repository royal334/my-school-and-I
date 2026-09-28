import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { hasOwnedListings } from '@/utils/supabase/queries/marketplace';
import { marketplaceQueryString, parseMarketplaceFilters } from '@/components/marketplace/filters';
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header';
import { MarketplaceFilters } from '@/components/marketplace/marketplace-filters';
import { MarketplaceFeed } from '@/components/marketplace/marketplace-feed';
import { ListingSkeletonGrid } from '@/components/marketplace/listing-skeleton';

export const metadata = {
  title: 'Marketplace | CampusHub',
  description: 'Buy and sell electronics, books, furniture and more on campus',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const filters = parseMarketplaceFilters(await searchParams);
  const hasListings = await hasOwnedListings(supabase, user.id);

  return (
    <div className="space-y-4 overflow-x-hidden">
      <MarketplaceHeader hasListings={hasListings} />
      <MarketplaceFilters />

      <Suspense key={marketplaceQueryString(filters)} fallback={<ListingSkeletonGrid />}>
        <MarketplaceFeed filters={filters} />
      </Suspense>
    </div>
  );
}