'use client';

import { useCallback, useEffect, useState } from 'react';
import { ListingDetailHeader } from './listing-detail-header';
import { PendingReportsAlert } from './pending-reports-alert';
import { ModerationPanel } from './moderation-panel';
import { ListingGallery } from './listing-gallery';
import { ListingDetailsCard } from './listing-details-card';
import { SellerCard } from './seller-card';
import { ListingReportsCard } from './listing-reports-card';
import { EmptyState } from '../empty-state';
import { LoadingSkeleton } from '../loading-skeleton';
import type { AdminListingDetail } from '../types';

interface AdminListingDetailViewProps {
  listingId: string;
}

export function AdminListingDetailView({ listingId }: AdminListingDetailViewProps) {
  // The fetch result is tagged with the id it belongs to, so a stale response is
  // never rendered and `loading` falls out of the comparison.
  const [result, setResult] = useState<{ id: string; listing: AdminListingDetail | null } | null>(
    null,
  );
  const [acting, setActing] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [error, setError] = useState('');

  const loading = result?.id !== listingId;
  const listing = result?.id === listingId ? result.listing : null;

  useEffect(() => {
    let active = true;

    fetch(`/api/admin/marketplace/listings/${listingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setResult({ id: listingId, listing: data.listing ?? null });
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [listingId]);

  const updateStatus = useCallback(
    async (status: string, notify: boolean) => {
      if (!listing) return;

      setActing(true);
      setError('');

      try {
        const res = await fetch(`/api/admin/marketplace/listings/${listing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            notify_seller: notify,
            notification_message: notifyMessage || null,
          }),
        });

        if (!res.ok) throw new Error('Failed to update the listing status.');

        setResult((prev) =>
          prev?.listing ? { ...prev, listing: { ...prev.listing, status } } : prev,
        );
        setNotifyMessage('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setActing(false);
      }
    },
    [listing, notifyMessage],
  );

  const removeBoost = useCallback(async () => {
    if (!listing) return;

    setActing(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/marketplace/listings/${listing.id}/remove-boost`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to remove the boost.');

      setResult((prev) =>
        prev?.listing ? { ...prev, listing: { ...prev.listing, is_boosted: false } } : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setActing(false);
    }
  }, [listing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <LoadingSkeleton count={4} height={110} />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background p-4">
        <EmptyState
          icon="🚫"
          title="Listing not found"
          description="It may have been deleted, or you may not have access to it."
        />
      </div>
    );
  }

  const pendingReports = listing.reports.filter((report) => report.status === 'pending');

  return (
    <div className="min-h-screen bg-background pb-20">
      <ListingDetailHeader listing={listing} />

      <div className="flex flex-col gap-3 p-4">
        <PendingReportsAlert reports={pendingReports} />

        <ModerationPanel
          status={listing.status}
          isBoosted={listing.is_boosted}
          acting={acting}
          error={error}
          notifyMessage={notifyMessage}
          onNotifyMessageChange={setNotifyMessage}
          onUpdateStatus={updateStatus}
          onRemoveBoost={removeBoost}
        />

        <ListingGallery images={listing.images} title={listing.title} />

        <ListingDetailsCard listing={listing} />

        <SellerCard listing={listing} />

        <ListingReportsCard reports={listing.reports} />
      </div>
    </div>
  );
}
