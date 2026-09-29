'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STAR_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Great'];

export function LeaveReviewForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/marketplace/listings/${listingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit review');

      setRating(0);
      setComment('');
      toast.success('Review submitted');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit review');
    } finally {
      setLoading(false);
    }
  }

  const activeStars = hovered || rating;

  return (
    <div className="mt-3 rounded-lg bg-muted p-3.5">
      <p className="mb-2.5 text-[13px] font-medium text-foreground">Leave a review</p>

      <div className="mb-2.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${i} star${i > 1 ? 's' : ''} — ${STAR_LABELS[i - 1]}`}
            aria-pressed={rating === i}
            className="cursor-pointer border-none bg-transparent p-0 transition-colors"
          >
            <Star
              className={cn(
                'size-6 fill-current transition-colors',
                i <= activeStars
                  ? 'text-accent-500'
                  : 'text-muted-foreground/30',
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="mb-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] outline-none focus:border-primary-500"
      />

      {error && <p className="mb-2 text-xs text-error">{error}</p>}

      <Button className="w-full" onClick={submit} disabled={loading}>
        {loading ? 'Submitting…' : 'Submit review'}
      </Button>
    </div>
  );
}