// components/vendors/review-card.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles: {
      full_name: string;
    } | null;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.profiles?.full_name
    ? review.profiles.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* Header */}
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h4 className="font-medium">
                  {review.profiles?.full_name || 'Anonymous'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Rating */}
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-accent-400 text-accent-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-foreground">{review.comment}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}