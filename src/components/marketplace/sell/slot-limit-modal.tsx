'use client';

import Link from 'next/link';
import { Store, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SellerSlots } from '@/components/marketplace/types';

interface SlotLimitModalProps {
  slots: SellerSlots;
  onClose: () => void;
}

/** Shown when the seller has no active-listing slots left. */
export function SlotLimitModal({ slots, onClose }: SlotLimitModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Listing limit reached"
        className="w-full max-w-[340px] rounded-2xl bg-card p-6 text-center shadow-xl"
      >
        <span className="text-4xl">📦</span>
        <h2 className="mt-3 mb-2 text-xl font-semibold text-foreground">Listing limit reached</h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          You have {slots.active_listings} of {slots.max_listings} active listings. Archive a
          listing or upgrade to sell more.
        </p>
        <div className="flex flex-col gap-2.5">
          <Button asChild>
            <Link href="/dashboard/marketplace/my-listings">
              <Package />
              Manage my listings
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-accent-300 bg-accent-500/10 text-accent-700 hover:bg-accent-500/20 dark:border-accent-600/50 dark:text-accent-400">
            <Link href="/dashboard/vendors/upgrade">
              <Store />
              Become a vendor — sell more
            </Link>
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer bg-transparent text-[13px] text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}