import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';

interface MyListingsEmptyStateProps {
  status: string;
}

export function MyListingsEmptyState({ status }: MyListingsEmptyStateProps) {
  const isActiveTab = status === 'active';

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="text-4xl">🛍️</span>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {isActiveTab ? "You don't have any active listings." : `No ${status} listings.`}
      </p>
      {isActiveTab && (
        <Button asChild>
          <Link href={`${MARKETPLACE_BASE_PATH}/sell`}>+ Create first listing</Link>
        </Button>
      )}
    </div>
  );
}