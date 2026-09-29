'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Archive, CheckCircle2, Eye, Pencil, RotateCcw, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MARKETPLACE_API_PATH, MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';
import { cn } from '@/lib/utils';

interface ListingStatusActionsProps {
  listingId: string;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  sold: 'Sold',
  archived: 'Archived',
  expired: 'Expired',
};

/** Sold / archive / relist controls for a single owned listing. */
export function ListingStatusActions({ listingId, status }: ListingStatusActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function changeStatus(next: string) {
    if (pending) return;
    setPending(true);

    try {
      const res = await fetch(`${MARKETPLACE_API_PATH}/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Request failed');

      toast.success(`Listing marked as ${STATUS_LABELS[next]?.toLowerCase() ?? next}.`);
      router.refresh();
    } catch {
      toast.error('Could not update the listing. Please try again.');
    } finally {
      setPending(false);
    }
  }

  const canRelist = status === 'archived' || status === 'expired';

  return (
    <div className="flex gap-2 border-t border-border p-3.5 overflow-x-auto">
      <Button asChild variant="outline" size="sm" className="flex-1">
        <Link href={`${MARKETPLACE_BASE_PATH}/${listingId}`}>
          <Eye />
          View
        </Link>
      </Button>

      {status === 'active' && (
        <>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`${MARKETPLACE_BASE_PATH}/sell?edit=${listingId}`}>
              <Pencil />
              Edit
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => changeStatus('sold')}
            disabled={pending}
          >
            <CheckCircle2 className={cn(pending && 'animate-pulse')} />
            Sold
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => changeStatus('archived')}
            disabled={pending}
          >
            <Archive />
            Archive
          </Button>
          <Link href={`${MARKETPLACE_BASE_PATH}/${listingId}/boost`}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Rocket />
              Boost
            </Button>
          </Link>
        </>
      )}

      {canRelist && (
        <Button
          type="button"
          size="sm"
          className="flex-[2]"
          onClick={() => changeStatus('active')}
          disabled={pending}
        >
          <RotateCcw />
          Relist
        </Button>
      )}
    </div>
  );
}