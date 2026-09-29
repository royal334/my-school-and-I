import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';

interface ListingEmptyStateProps {
  hasFilters: boolean;
}

export function ListingEmptyState({ hasFilters }: ListingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3.5 px-6 py-12 text-center">
      <span className="text-4xl">🛍️</span>
      <h2 className="text-xl font-semibold text-foreground">
        {hasFilters ? 'No listings match your filters' : 'No listings yet'}
      </h2>
      <p className="max-w-65 text-sm leading-relaxed text-muted-foreground">
        {hasFilters
          ? 'Try adjusting your filters.'
          : 'Be the first to sell something on CampusHub!'}
      </p>
      <div className="flex gap-2.5">
        {hasFilters && (
          <Button asChild variant="outline">
            <Link href={MARKETPLACE_BASE_PATH}>Clear filters</Link>
          </Button>
        )}
        <Button asChild>
          <Link href={`${MARKETPLACE_BASE_PATH}/sell`}>+ Sell something</Link>
        </Button>
      </div>
    </div>
  );
}