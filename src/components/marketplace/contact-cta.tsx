'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/marketplace/save-button';

interface ContactCtaProps {
  listingId: string;
  saved: boolean;
  title: string;
  price: number;
}

/** Sticky bottom bar shown to buyers on active, non-owned listings. */
export function ContactCta({ listingId, saved, title, price }: ContactCtaProps) {
  const waLink = `https://wa.me/?text=${encodeURIComponent(
    `Hi, I'm interested in your listing on CampusHub: ${title} (₦${price})`,
  )}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2.5 border-t border-border bg-background p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
      <Button
        asChild
        className="h-12 flex-1 bg-[#25D366] py-3 hover:bg-[#1fb657]"
      >
        <a href={waLink} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="size-4" />
          WhatsApp seller
        </a>
      </Button>
      <SaveButton listingId={listingId} saved={saved} variant="bar" />
    </div>
  );
}