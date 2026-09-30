'use client';

import { useCallback, useEffect, useState } from 'react';
import { ReferralsHeader } from './referrals-header';
import { ReferralStatsRow } from './referral-stats';
import { ReferralRow } from './referral-row';
import { ReferralsEmptyState } from './referrals-empty-state';
import { ReferralsLoadingSkeleton } from './referrals-loading';
import { FilterChips } from './filter-chips';
import {
  isReferralFilter,
  REFERRAL_FILTERS,
  type Referral,
  type ReferralFilter,
  type ReferralStats,
} from './types';

const EMPTY_STATS: ReferralStats = {
  awaiting_payout: 0,
  processing: 0,
  paid_count: 0,
  total_paid: 0,
};

export function ReferralsDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>(EMPTY_STATS);
  const [filter, setFilter] = useState<ReferralFilter>('eligible');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const url = filter
          ? `/api/admin/accommodation/referrals?status=${filter}`
          : '/api/admin/accommodation/referrals';
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (!active) return;
        setReferrals(data.referrals || []);
        setStats(data.stats || EMPTY_STATS);
      } catch (e) {
        if (!active) return;
        setReferrals([]);
        setLoadError(e instanceof Error ? e.message : 'Could not load referrals');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [filter]);

  // A PATCH response only carries the referrer join, so patch the row locally
  // rather than refetching the whole list and losing the active filter's scroll.
  const handleUpdate = useCallback((updated: Referral) => {
    setReferrals(prev => prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r)));
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-background">
      <ReferralsHeader />

      <div className="flex flex-col gap-4 p-4">
        <ReferralStatsRow stats={stats} />

        <div>
          <FilterChips
            filters={[...REFERRAL_FILTERS]}
            value={filter}
            onChange={value => {
              if (isReferralFilter(value)) setFilter(value);
            }}
          />

          {loadError && (
            <p className="mb-3 text-[13px] text-error">{loadError}</p>
          )}

          {loading ? (
            <ReferralsLoadingSkeleton />
          ) : referrals.length === 0 ? (
            <ReferralsEmptyState filter={filter} />
          ) : (
            <div className="flex flex-col gap-2.5">
              {referrals.map(referral => (
                <ReferralRow
                  key={referral.id}
                  referral={referral}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
