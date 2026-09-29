'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getListingStatusTone } from '../constants';
import type { AdminListingDetail } from '../types';

interface ListingDetailHeaderProps {
  listing: AdminListingDetail;
}

export function ListingDetailHeader({ listing }: ListingDetailHeaderProps) {
  const router = useRouter();
  const statusTone = getListingStatusTone(listing.status);
  const sellerLabel = listing.seller_type === 'vendor' ? '🏪 Vendor' : '🎓 Student';

  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="cursor-pointer rounded-lg p-1 text-primary-200 transition-colors hover:bg-white/10 hover:text-white dark:text-primary-300"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-white">
            {listing.title}
          </h1>
          <p className="mt-0.5 truncate text-xs text-primary-200 dark:text-primary-300">
            {sellerLabel} · {listing.category}
          </p>
        </div>

        <Badge className="bg-white/15 text-white">{statusTone.label}</Badge>
      </div>
    </header>
  );
}
