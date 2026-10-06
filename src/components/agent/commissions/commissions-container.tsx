'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommissionsHeader } from './commissions-header';
import { CommissionNotice } from './commission-notice';
import { CommissionFilterTabs } from './commission-filter-tabs';
import { CommissionsList } from './commissions-list';
import { countForStatus, totalForStatus } from './format';
import type { CommissionRecord } from './types';

interface CommissionResult {
  /** The filter this result was fetched for, so stale data is never shown. */
  filter: string;
  commissions: CommissionRecord[];
}

export function CommissionsContainer() {
  const [result, setResult] = useState<CommissionResult | null>(null);
  const [filter, setFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const url = filter
      ? `/api/agent/commissions?status=${filter}`
      : '/api/agent/commissions';

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setResult({ filter, commissions: d.commissions || [] });
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setResult({ filter, commissions: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const loading = result?.filter !== filter;
  const commissions = useMemo(
    () => (loading ? [] : result.commissions),
    [loading, result],
  );

  const confirmedTotal = useMemo(
    () => totalForStatus(commissions, ['confirmed', 'payment_recorded']),
    [commissions],
  );
  const paidTotal = useMemo(
    () => totalForStatus(commissions, ['payment_recorded']),
    [commissions],
  );
  const confirmedCount = useMemo(
    () => countForStatus(commissions, 'confirmed'),
    [commissions],
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <CommissionsHeader
        onBack={() => router.back()}
        confirmedTotal={confirmedTotal}
        paidTotal={paidTotal}
        showTotals={!loading && commissions.length > 0}
      />
      <CommissionNotice />
      <CommissionFilterTabs active={filter} onChange={setFilter} confirmedCount={confirmedCount} />
      <CommissionsList loading={loading} commissions={commissions} filter={filter} />
    </div>
  );
}
