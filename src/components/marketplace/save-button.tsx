'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePostHogAnalytics } from '@/hooks/posthog-events';
import { POSTHOG_EVENTS } from '@/utils/constants/constants';

export type SaveButtonVariant = 'floating' | 'header' | 'bar';

interface SaveButtonProps {
  listingId: string;
  saved: boolean;
  variant?: SaveButtonVariant;
}

const VARIANT_CLASSES: Record<SaveButtonVariant, string> = {
  floating:
    'absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full border border-border bg-background/90 shadow-sm backdrop-blur',
  header:
    'inline-flex size-9 items-center justify-center rounded-md text-accent hover:bg-white/10',
  bar: 'flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-border px-4',
};

export function SaveButton({ listingId, saved, variant = 'floating' }: SaveButtonProps) {
  const router = useRouter();
  const { track } = usePostHogAnalytics();
  const [isSaved, setIsSaved] = useState(saved);
  const [pending, setPending] = useState(false);

  async function toggleSave(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;

    setPending(true);
    const next = !isSaved;
    setIsSaved(next);

    try {
      const res = await fetch(`/api/marketplace/listings/${listingId}/save`, {
        method: next ? 'POST' : 'DELETE',
      });
      if (!res.ok) throw new Error('Request failed');
      track(
        next
          ? POSTHOG_EVENTS.marketplaceListingSaved
          : POSTHOG_EVENTS.marketplaceListingUnsaved,
        { listing_id: listingId },
      );
      router.refresh();
    } catch {
      setIsSaved(!next);
      toast.error('Could not update your saved items. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSave}
      disabled={pending}
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
      className={cn(
        VARIANT_CLASSES[variant],
        variant === 'bar' &&
          (isSaved
            ? 'bg-error-bg text-error-text hover:bg-error/15'
            : 'bg-muted text-foreground hover:bg-muted/70'),
        variant === 'header' && (isSaved ? 'text-accent' : 'text-primary-foreground'),
        variant === 'floating' && (isSaved ? 'text-error' : 'text-muted-foreground'),
        pending && 'opacity-60',
      )}
    >
      <Heart
        className={cn(
          'size-4',
          variant === 'header' && 'size-5',
          variant === 'bar' && 'size-5',
          isSaved && 'fill-current',
        )}
      />
      {variant === 'bar' && <span className="text-sm font-medium">{isSaved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}