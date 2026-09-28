import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkAsSoldButton } from '@/components/marketplace/mark-as-sold-button';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';
import type { MarketplaceListingDetail } from '@/components/marketplace/types';

export function OwnerActions({ listing }: { listing: MarketplaceListingDetail }) {
  if (!listing.is_own || listing.status === 'sold') return null;

  return (
    <div className="flex gap-2.5">
      <Button asChild variant="outline" className="flex-1">
        <Link href={`${MARKETPLACE_BASE_PATH}/sell?edit=${listing.id}`}>
          <Pencil />
          Edit
        </Link>
      </Button>
      <MarkAsSoldButton listingId={listing.id} />
    </div>
  );
}