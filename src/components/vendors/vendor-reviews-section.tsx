import ReviewCard from "./review-card";
import ReviewForm from "./review-form";
import { Card, CardContent } from "@/components/ui/card";

interface VendorReviewsSectionProps {
  vendorId: string;
  reviews: any[];
  isOwner: boolean;
  existingReview: any;
}

export default function VendorReviewsSection({
  vendorId,
  reviews,
  isOwner,
  existingReview,
}: VendorReviewsSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-4 text-xl font-bold">Customer Reviews</h2>

        {/* Review Form (if not owner and haven't reviewed) */}
        {!isOwner && !existingReview && (
          <div className="mb-6">
            <ReviewForm vendorId={vendorId} />
          </div>
        )}

        {/* Reviews List */}
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet. Be the first to review!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
