'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/marketplace/save-button';
import { usePostHogAnalytics } from '@/hooks/posthog-events';
import { POSTHOG_EVENTS } from '@/utils/constants/constants';

interface ContactCtaProps {
  listingId: string;
  saved: boolean;
  title: string;
  price: number;
}

/** Sticky bottom bar shown to buyers on active, non-owned listings. */
export function ContactCta({ listingId, saved, title, price }: ContactCtaProps) {
  const { track } = usePostHogAnalytics();
  const waLink = `https://wa.me/?text=${encodeURIComponent(
    `Hi, I'm interested in your listing on Campus&Me: ${title} (₦${price})`,
  )}`;

  return (
    <div className="flex gap-2.5 border-t border-border bg-background p-3">
      <Button
        asChild
        className="h-12 flex-1 bg-[#25D366] py-3 hover:bg-[#1fb657]"
      >
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track(POSTHOG_EVENTS.marketplaceContactSeller, { listing_id: listingId })
          }
        >
          <MessageCircle className="size-4" />
          WhatsApp seller
        </a>
      </Button>
      <SaveButton listingId={listingId} saved={saved} variant="bar" />
    </div>
  );
}