'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { MARKETPLACE_API_PATH } from '@/components/marketplace/filters';
import { cn } from '@/lib/utils';

interface RemoveSavedButtonProps {
  listingId: string;
}

/** Heart overlay on a saved card; unsaving refreshes the server-rendered grid. */
export function RemoveSavedButton({ listingId }: RemoveSavedButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    if (pending) return;
    setPending(true);

    try {
      const res = await fetch(`${MARKETPLACE_API_PATH}/listings/${listingId}/save`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Request failed');
      router.refresh();
    } catch {
      toast.error('Could not remove the saved item. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={pending}
      aria-label="Remove from saved"
      aria-pressed
      className={cn(
        'absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full border border-border bg-background/90 text-error shadow-sm backdrop-blur',
        pending && 'cursor-not-allowed opacity-60',
      )}
    >
      <Heart className="size-3.5 fill-current" />
    </button>
  );
}