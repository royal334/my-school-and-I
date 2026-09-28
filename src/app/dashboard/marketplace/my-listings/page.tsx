import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/server';
import { getOwnedListings, getSellerSlots } from '@/utils/supabase/queries/marketplace';
import { MARKETPLACE_BASE_PATH, parseOwnedListingsStatus } from '@/components/marketplace/filters';
import { SubpageHeader } from '@/components/marketplace/subpage-header';
import { MyListingsTabs } from '@/components/marketplace/my-listings/my-listings-tabs';
import { MyListingRow } from '@/components/marketplace/my-listings/my-listing-row';
import { MyListingsEmptyState } from '@/components/marketplace/my-listings/my-listings-empty-state';

export const metadata = {
  title: 'My listings | Marketplace | CampusHub',
  description: 'Manage the items you are selling on campus',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MyListingsPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const status = parseOwnedListingsStatus(await searchParams);
  const [{ listings, counts }, slots] = await Promise.all([
    getOwnedListings(supabase, user.id),
    getSellerSlots(supabase, user.id),
  ]);

  const visible = status === 'all' ? listings : listings.filter((listing) => listing.status === status);

  return (
    <div className="pb-16">
      <SubpageHeader
        title="My listings"
        subtitle={`${slots.active_listings} active · ${slots.available_slots} slot${slots.available_slots !== 1 ? 's' : ''} remaining`}
        action={
          <Button asChild size="sm" className="bg-accent text-accent-950 hover:bg-accent-600 hover:text-accent-50">
            <Link href={`${MARKETPLACE_BASE_PATH}/sell`}>
              <Plus className="size-3.5" />
              New listing
            </Link>
          </Button>
        }
      />

      <MyListingsTabs active={status} counts={counts} />

      <div className="flex flex-col gap-2.5 p-4">
        {visible.length === 0 ? (
          <MyListingsEmptyState status={status} />
        ) : (
          visible.map((listing) => <MyListingRow key={listing.id} listing={listing} />)
        )}
      </div>
    </div>
  );
}