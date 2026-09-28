import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SellerBadge } from '@/components/marketplace/seller-badge';
import type { MarketplaceListingDetail } from '@/components/marketplace/types';

export function ListingSellerCard({ listing }: { listing: MarketplaceListingDetail }) {
  const profile = listing.seller_profile;
  const displayName =
    listing.seller_type === 'vendor' && listing.vendor
      ? listing.vendor.business_name
      : listing.seller_name;

  return (
    <div className="mb-3 rounded-xl border border-border bg-card p-4">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
        Seller
      </p>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="mb-0.5 text-[15px] font-medium text-foreground">{displayName}</p>
          <div className="flex items-center gap-1.5">
            <SellerBadge
              type={listing.seller_type}
              verified={listing.seller_type === 'vendor'}
            />
            {profile?.average_rating ? (
              <span className="text-[11px] font-medium text-accent-600 dark:text-accent-400">
                ★ {profile.average_rating.toFixed(1)}
                <span className="font-normal text-muted-foreground">
                  {' '}
                  ({profile.review_count})
                </span>
              </span>
            ) : null}
          </div>
          {profile?.total_sales ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {profile.total_sales} sales
            </p>
          ) : null}
        </div>

        {listing.seller_type === 'vendor' && listing.vendor_id && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/dashboard/vendors/${listing.vendor_id}`}>
              <Store />
              View store
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}