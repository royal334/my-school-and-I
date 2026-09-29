import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { MarketplaceBrowse } from '@/components/marketplace/marketplace-browse';
import { parseMarketplaceFilters } from '@/components/marketplace/filters';
import { hasOwnedListings } from '@/utils/supabase/queries/marketplace';

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

  return <MarketplaceBrowse filters={filters} hasListings={hasListings} />;
}