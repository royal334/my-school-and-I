'use client';

import { useEffect, useRef } from 'react';

interface ListingViewTrackerProps {
  listingId: string;
  isOwner?: boolean;
}

/**
 * Reports a single view of a listing on mount.
 *
 * Mirrors VendorViewTracker, but posts to the marketplace beacon rather than
 * firing an analytics event. The beacon calls the atomic
 * increment_marketplace_views() SQL function, so concurrent viewers cannot
 * overwrite each other the way the previous read-modify-write did.
 */
export default function ListingViewTracker({ listingId, isOwner = false }: ListingViewTrackerProps) {
  // Survives StrictMode's double-invoked effects so dev never double counts.
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    if (!listingId || isOwner) return;
    if (sentFor.current === listingId) return;

    sentFor.current = listingId;

    fetch(`/api/marketplace/listings/${listingId}/view`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) console.error('Failed to record listing view:', res.status);
      })
      .catch((error) => {
        console.error('Error recording listing view:', error);
      });
  }, [isOwner, listingId]);

  return null;
}
