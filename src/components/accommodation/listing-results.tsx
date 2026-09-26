import Link from 'next/link';
import { House, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListingCard } from '@/components/accommodation/listing-card';
import { ListingSkeleton } from '@/components/accommodation/listing-skeleton';
import type { Listing } from '@/components/accommodation/types';

interface ListingResultsProps {
  loading: boolean;
  listings: Listing[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ListingResults({
  loading,
  listings,
  hasActiveFilters,
  onClearFilters,
}: ListingResultsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ListingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-border">
        <div className="rounded-full bg-primary-50 p-4 dark:bg-primary-950/50">
          <House className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-lg">No accommodation found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasActiveFilters
            ? 'Try adjusting your filters to see more results'
            : 'Know of a vacant accommodation near campus? Be the first to submit it'}
        </p>
        {hasActiveFilters ? (
          <Button
            variant="outline"
            className="mt-4"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        ) : (
          <Link href="/dashboard/accommodation/submit">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Submit accommodation
            </Button>
          </Link>
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}