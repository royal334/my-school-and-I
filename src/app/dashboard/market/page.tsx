import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { hasOwnedListings } from '@/utils/supabase/queries/marketplace';
import { parseMarketplaceFilters } from '@/components/marketplace/filters';
import { MarketplaceBrowse } from '@/components/marketplace/marketplace-browse';
import { VendorDirectory } from '@/components/vendors/vendor-directory';
import { MarketTabs, type MarketTab } from '@/components/market/market-tabs';

export const metadata = {
  title: 'Market | CampusHub',
  description: 'Browse marketplace listings and verified campus vendors',
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const activeTab: MarketTab = params.tab === 'vendors' ? 'vendors' : 'marketplace';
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="space-y-4 overflow-x-hidden" data-tour="page-market">
      <MarketTabs activeTab={activeTab} />
      {activeTab === 'vendors' ? (
        <VendorDirectory
          userId={user.id}
          searchParams={params}
          filterPath="/dashboard/market?tab=vendors"
        />
      ) : (
        <MarketplaceBrowse
          filters={parseMarketplaceFilters(params)}
          hasListings={await hasOwnedListings(supabase, user.id)}
        />
      )}
    </div>
  );
}
