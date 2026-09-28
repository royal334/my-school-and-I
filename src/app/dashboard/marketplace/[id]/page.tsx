import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { getMarketplaceListing } from '@/utils/supabase/queries/marketplace';
import { ListingDetailHeader } from '@/components/marketplace/listing-detail-header';
import { ListingGallery } from '@/components/marketplace/listing-gallery';
import { ListingSummary } from '@/components/marketplace/listing-summary';
import { ListingSellerCard } from '@/components/marketplace/listing-seller-card';
import { ListingReviews } from '@/components/marketplace/listing-reviews';
import { ReportListingButton } from '@/components/marketplace/report-listing-button';
import { OwnerActions } from '@/components/marketplace/owner-actions';
import { ContactCta } from '@/components/marketplace/contact-cta';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Deduped per request so generateMetadata and the page share one query.
const fetchListing = cache(async (listingId: string) => {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getMarketplaceListing(supabase, user.id, listingId);
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchListing(id).catch(() => null);

  if (!result) return { title: 'Listing not found | CampusHub' };

  return {
    title: `${result.listing.title} | Marketplace | CampusHub`,
    description: result.listing.description ?? undefined,
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await fetchListing(id);

  if (!result) notFound();

  const { listing, reviews, userReview } = result;
  const isSold = listing.status === 'sold';
  const showBuyerActions = !listing.is_own && !isSold;

  return (
    <div className={`space-y-3 overflow-x-hidden ${showBuyerActions ? 'pb-24' : ''}`}>
      <ListingDetailHeader title={listing.title} listingId={listing.id} saved={listing.is_saved} />

      <ListingGallery images={listing.images} title={listing.title} isSold={isSold} />

      <ListingSummary listing={listing} />
      <ListingSellerCard listing={listing} />
      <ListingReviews listing={listing} reviews={reviews} userReview={userReview} />

      {!listing.is_own && (
        <div className="mb-2">
          <ReportListingButton listingId={listing.id} />
        </div>
      )}

      <OwnerActions listing={listing} />

      {showBuyerActions && (
        <ContactCta
          listingId={listing.id}
          saved={listing.is_saved}
          title={listing.title}
          price={listing.price}
        />
      )}
    </div>
  );
}
