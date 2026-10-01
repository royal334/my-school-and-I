import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getOwnedListingForBoost } from '@/utils/supabase/queries/marketplace';
import { BoostHeader } from '@/components/marketplace/boost/boost-header';
import { BoostCheckout } from '@/components/marketplace/boost/boost-checkout';
import { BoostUnavailable } from '@/components/marketplace/boost/boost-unavailable';

export const metadata = {
  title: 'Boost listing | Marketplace | Campus&Me',
  description: 'Promote one of your listings to more campus buyers',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BoostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const listing = await getOwnedListingForBoost(supabase, user.id, id);

  if (!listing || listing.status !== 'active') {
    return (
      <div className="pb-16">
        <BoostHeader title={listing?.title ?? 'Listing'} />
        <div className="p-4">
          <BoostUnavailable reason={listing ? 'inactive' : 'not_found'} />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <BoostHeader title={listing.title} />

      <div className="p-4">
        {listing.is_boosted && (
          <p className="mb-3.5 rounded-lg border border-accent-300/60 bg-accent-500/10 px-3.5 py-3 text-[13px] text-accent-700 dark:border-accent-600/40 dark:text-accent-400">
            🔥 This listing is already boosted. You can boost again to extend or upgrade.
          </p>
        )}

        <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
          Boosting places your listing in front of more buyers on Campus&Me. Choose how much reach
          you want.
        </p>

        <BoostCheckout listingId={listing.id} listingTitle={listing.title} />
      </div>
    </div>
  );
}