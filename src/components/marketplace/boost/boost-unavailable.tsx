import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';

interface BoostUnavailableProps {
  reason: 'not_found' | 'inactive';
}

/** Shown when the listing is missing, not owned by the user, or not active. */
export function BoostUnavailable({ reason }: BoostUnavailableProps) {
  const isInactive = reason === 'inactive';

  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <PackageSearch className="mx-auto mb-2 size-8 text-muted-foreground/50" />
      <p className="mb-2 text-sm font-medium text-foreground">
        {isInactive ? 'Only active listings can be boosted.' : 'Listing not found.'}
      </p>
      <p className="mb-5 text-[13px] text-muted-foreground">
        {isInactive
          ? 'Relist the item before boosting it.'
          : 'It may have been removed, or it belongs to another seller.'}
      </p>
      <Button asChild>
        <Link href={`${MARKETPLACE_BASE_PATH}/my-listings`}>Go to my listings</Link>
      </Button>
    </div>
  );
}