import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSavedListings } from '@/utils/supabase/queries/marketplace';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';
import { SubpageHeader } from '@/components/marketplace/subpage-header';
import { SavedListingCard } from '@/components/marketplace/saved/saved-listing-card';
import { SavedListingsEmptyState } from '@/components/marketplace/saved/saved-listings-empty-state';

export const metadata = {
  title: 'Saved listings | Marketplace | CampusHub',
  description: 'Listings you saved for later',
};

export default async function SavedListingsPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const listings = await getSavedListings(supabase, user.id);

  return (
    <div className="pb-16">
      <SubpageHeader
        title="Saved listings"
        subtitle={`${listings.length} saved item${listings.length !== 1 ? 's' : ''}`}
        backHref={MARKETPLACE_BASE_PATH}
      />

      <div className="p-4">
        {listings.length === 0 ? (
          <SavedListingsEmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <SavedListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}