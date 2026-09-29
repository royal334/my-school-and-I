import { MessageSquareQuote, Check } from 'lucide-react';
import { LeaveReviewForm } from '@/components/marketplace/leave-review-form';
import { ReviewCard } from '@/components/marketplace/review-card';
import { StarRow } from '@/components/marketplace/star-row';
import type { MarketplaceListingDetail, MarketplaceReview, UserReview } from '@/components/marketplace/types';

interface ListingReviewsProps {
  listing: MarketplaceListingDetail;
  reviews: MarketplaceReview[];
  userReview: UserReview | null;
}

export function ListingReviews({ listing, reviews, userReview }: ListingReviewsProps) {
  const average = listing.seller_profile?.average_rating;

  return (
    <div className="mb-3 rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
          <MessageSquareQuote className="size-3.5" />
          Reviews
        </p>
        {average ? (
          <div className="flex items-center gap-1.5">
            <StarRow rating={average} size={13} />
            <span className="text-xs text-muted-foreground">{average.toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      {reviews.length === 0 ? (
        <p className="py-2 text-[13px] text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {!listing.is_own && !userReview && <LeaveReviewForm listingId={listing.id} />}

      {userReview && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary-500/10 px-3 py-2.5 text-xs text-primary">
          <Check className="size-3.5" />
          You reviewed this listing
        </div>
      )}
    </div>
  );
}