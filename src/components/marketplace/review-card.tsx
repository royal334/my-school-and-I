import { formatDistanceToNow } from 'date-fns';
import { StarRow } from '@/components/marketplace/star-row';
import type { MarketplaceReview } from '@/components/marketplace/types';

export function ReviewCard({ review }: { review: MarketplaceReview }) {
  return (
    <div className="py-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-foreground">
            {review.reviewer?.full_name || 'Anonymous'}
          </p>
          <StarRow rating={review.rating} size={12} />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
        </p>
      </div>
      {review.comment && (
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {review.comment}
        </p>
      )}
    </div>
  );
}