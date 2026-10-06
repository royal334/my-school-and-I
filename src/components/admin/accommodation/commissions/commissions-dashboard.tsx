'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CommissionsHeader } from './commissions-header';
import { CommissionFilterTabs } from './commission-filter-tabs';
import { CommissionRow } from './commission-row';
import { CommissionsEmptyState } from './commissions-empty-state';
import { CommissionsLoadingSkeleton } from './commissions-loading-skeleton';
import { COMMISSIONS_ENDPOINT } from './constants';
import {
  getCommissionFilterLabel,
  isCommissionFilterKey,
  type AdminCommission,
  type CommissionFilterKey,
} from './types';

interface CommissionResult {
  /** The filter this result was fetched for, so stale rows are never shown. */
  filter: string;
  commissions: AdminCommission[];
}

export function CommissionsDashboard() {
  const [result, setResult] = useState<CommissionResult | null>(null);
  const [filter, setFilter] = useState<CommissionFilterKey>('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    const url = filter ? `${COMMISSIONS_ENDPOINT}?status=${filter}` : COMMISSIONS_ENDPOINT;

    fetch(url)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load commissions');
        if (!active) return;
        setResult({ filter, commissions: data.commissions || [] });
        setLoadError('');
      })
      .catch(err => {
        if (!active) return;
        setResult({ filter, commissions: [] });
        setLoadError(err instanceof Error ? err.message : 'Could not load commissions');
      });

    return () => {
      active = false;
    };
  }, [filter]);

  const loading = result?.filter !== filter;
  const commissions = useMemo(
    () => (loading ? [] : result.commissions),
    [loading, result],
  );

  const pendingCount = useMemo(
    () => commissions.filter(c => c.status === 'pending_confirmation').length,
    [commissions],
  );
  const awaitingPaymentCount = useMemo(
    () => commissions.filter(c => c.status === 'confirmed').length,
    [commissions],
  );

  const handleFilterChange = useCallback((key: string) => {
    if (isCommissionFilterKey(key)) setFilter(key);
  }, []);

  // A PATCH response only carries the record itself, so patch the row in place
  // rather than refetching and dropping the admin's active filter and scroll.
  const handleUpdate = useCallback((updated: AdminCommission) => {
    setResult(prev =>
      prev
        ? {
            ...prev,
            commissions: prev.commissions.map(c => (c.id === updated.id ? { ...c, ...updated } : c)),
          }
        : prev,
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-background">
      <CommissionsHeader
        pendingCount={pendingCount}
        awaitingPaymentCount={awaitingPaymentCount}
      />

      <CommissionFilterTabs value={filter} onChange={handleFilterChange} pendingCount={pendingCount} />

      <div className="flex flex-col gap-2.5 p-4">
        {loadError && (
          <p className="flex items-center gap-2 rounded-lg border border-error/20 bg-error-bg px-3.5 py-2.5 text-[13px] text-error-text">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {loadError}
          </p>
        )}

        {loading ? (
          <CommissionsLoadingSkeleton />
        ) : commissions.length === 0 ? (
          <CommissionsEmptyState filterLabel={getCommissionFilterLabel(filter)} />
        ) : (
          commissions.map(commission => (
            <CommissionRow
              key={commission.id}
              commission={commission}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
