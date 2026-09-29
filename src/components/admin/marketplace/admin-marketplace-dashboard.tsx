'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminMarketplaceHeader } from './admin-marketplace-header';
import { OverviewTab } from './overview-tab';
import { ReportsTab } from './reports-tab';
import { ListingsTab } from './listings-tab';
import type {
  AdminListingSummary,
  AdminMarketplaceTab,
  AdminReport,
  AdminReportAction,
  AdminStats,
} from './types';

interface KeyedResult<T> {
  key: string;
  data: T;
}

export function AdminMarketplaceDashboard() {
  const [activeTab, setActiveTab] = useState<AdminMarketplaceTab>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  /** Bumped after any moderation action so counts and lists re-sync. */
  const [revision, setRevision] = useState(0);

  const [reportFilter, setReportFilter] = useState<string>('pending');
  const [reportsResult, setReportsResult] = useState<KeyedResult<AdminReport[]> | null>(null);

  const [listingFilter, setListingFilter] = useState<string>('active');
  const [listingSearch, setListingSearch] = useState('');
  const [listingsResult, setListingsResult] = useState<KeyedResult<AdminListingSummary[]> | null>(
    null,
  );

  // Results are tagged with the request they belong to, so a stale response can
  // never be rendered and `loading` falls out of the comparison — no setState
  // needed inside the effects.
  const reportsKey = `${reportFilter}|${revision}`;
  const reportsLoading = reportsResult?.key !== reportsKey;
  const reports = reportsResult?.key === reportsKey ? reportsResult.data : [];

  const listingsKey = `${listingFilter}|${listingSearch}|${revision}`;
  const listingsLoading = listingsResult?.key !== listingsKey;
  const listings = listingsResult?.key === listingsKey ? listingsResult.data : [];

  useEffect(() => {
    let active = true;

    fetch('/api/admin/marketplace/stats')
      .then((res) => res.json())
      .then((data) => {
        if (active) setStats(data.stats ?? null);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [revision]);

  useEffect(() => {
    let active = true;
    const key = reportsKey;

    fetch(`/api/admin/marketplace/reports?status=${reportFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setReportsResult({ key, data: data.reports ?? [] });
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [reportFilter, reportsKey]);

  useEffect(() => {
    let active = true;
    const key = listingsKey;

    const params = new URLSearchParams({ status: listingFilter, search: listingSearch });

    fetch(`/api/admin/marketplace/listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setListingsResult({ key, data: data.listings ?? [] });
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [listingFilter, listingSearch, listingsKey]);

  const handleReportAction = useCallback(
    async (reportId: string, action: AdminReportAction, listingId?: string) => {
      try {
        const res = await fetch(`/api/admin/marketplace/reports/${reportId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, listing_id: listingId }),
        });

        if (!res.ok) return;

        setReportsResult((prev) =>
          prev ? { ...prev, data: prev.data.filter((report) => report.id !== reportId) } : prev,
        );
        setRevision((n) => n + 1);
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  const handleRemoveListing = useCallback(async (id: string) => {
    if (!window.confirm('Remove this listing?')) return;

    try {
      const res = await fetch(`/api/admin/marketplace/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'removed' }),
      });

      if (!res.ok) return;

      setListingsResult((prev) =>
        prev ? { ...prev, data: prev.data.filter((listing) => listing.id !== id) } : prev,
      );
      setRevision((n) => n + 1);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminMarketplaceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingReports={stats?.pending_reports ?? 0}
      />

      <div className="p-4">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} onSelectTab={setActiveTab} />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            reports={reports}
            loading={reportsLoading}
            filter={reportFilter}
            onFilterChange={setReportFilter}
            onAction={handleReportAction}
          />
        )}

        {activeTab === 'listings' && (
          <ListingsTab
            listings={listings}
            loading={listingsLoading}
            filter={listingFilter}
            onFilterChange={setListingFilter}
            search={listingSearch}
            onSearchChange={setListingSearch}
            onRemove={handleRemoveListing}
          />
        )}
      </div>
    </div>
  );
}
