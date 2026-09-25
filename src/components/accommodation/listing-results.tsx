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
      <Card className="flex flex-col items-center justify-center p-12 text-center border-[#D6E5DF] dark:border-white/10">
        <div className="rounded-full bg-[#E8F5EF] dark:bg-[#1E211F] p-4">
          <House className="h-8 w-8 text-[#4A8C73] dark:text-[#7EC8A0]" />
        </div>
        <h3 className="mt-4 text-lg">No accommodation found</h3>
        <p className="mt-2 text-sm text-[#6B7B75] dark:text-[#9BA19E]">
          {hasActiveFilters
            ? 'Try adjusting your filters to see more results'
            : 'Know of a vacant accommodation near campus? Be the first to submit it'}
        </p>
        {hasActiveFilters ? (
          <Button
            variant="outline"
            className="mt-4 border-[#D6E5DF] dark:border-white/10"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        ) : (
          <Link href="/dashboard/accommodation/submit">
            <Button className="mt-4 bg-[#1A3C34] hover:bg-[#141F1B] text-[#E8F5EF]">
              <Plus className="mr-2 h-4 w-4" />
              Submit accommodation
            </Button>
          </Link>
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-tour="page-accommodation">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}