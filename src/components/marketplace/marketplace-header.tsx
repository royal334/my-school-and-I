import Link from 'next/link';
import { Heart, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketplaceSearch } from '@/components/marketplace/marketplace-search';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';

interface MarketplaceHeaderProps {
  hasListings: boolean;
}

export function MarketplaceHeader({ hasListings }: MarketplaceHeaderProps) {
  return (
    <div className="rounded-xl bg-primary p-4 pb-3.5 dark:bg-primary-900" data-tour="page-marketplace">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <h1 className="text-[22px] font-semibold tracking-tight text-white">
          Marketplace
        </h1>
        <div className="flex items-center gap-2">
          {hasListings && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href={`${MARKETPLACE_BASE_PATH}/my-listings`}>
                <Package className="size-3.5" />
                My listings
              </Link>
            </Button>
          )}
          <Button
            asChild
            size="sm"
            className="bg-accent text-accent-950 hover:bg-accent-600 hover:text-accent-50"
          >
            <Link href={`${MARKETPLACE_BASE_PATH}/sell`}>
              <Plus className="size-3.5" />
              Sell
            </Link>
          </Button>
        </div>
      </div>

      <MarketplaceSearch />
    </div>
  );
}