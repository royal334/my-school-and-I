import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';

export function ListingNotFound() {
  return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">Listing not found.</p>
      <Button asChild className="mt-4">
        <Link href={MARKETPLACE_BASE_PATH}>Browse listings</Link>
      </Button>
    </div>
  );
}