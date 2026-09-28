import { Flame } from 'lucide-react';
import { ListingGrid } from '@/components/marketplace/listing-grid';
import type { MarketplaceListing } from '@/components/marketplace/types';

export function PromotedSection({ listings }: { listings: MarketplaceListing[] }) {
  if (listings.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center gap-2">
        <Flame className="size-3.5 text-accent-500" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-accent-700 dark:text-accent-400">
          Promoted
        </h2>
      </div>
      <ListingGrid listings={listings} />
    </div>
  );
}