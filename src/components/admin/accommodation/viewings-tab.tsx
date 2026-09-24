'use client';

import { useEffect, useState } from 'react';
import { FilterChips } from './filter-chips';
import { ListLoadingSkeleton } from './loading-skeleton';
import { ViewingRow } from './viewing-row';
import type { Viewing } from './types';

const FILTERS = ['pending', 'scheduled', 'completed', 'cancelled', ''];

export function ViewingsTab() {
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter
      ? `/api/admin/accommodation/viewings?status=${filter}&limit=50`
      : '/api/admin/accommodation/viewings?limit=50';

    fetch(url)
      .then(r => r.json())
      .then(d => setViewings(d.viewings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <FilterChips filters={FILTERS} value={filter} onChange={setFilter} formatLabel={f => f || 'All'} />

      {loading ? (
        <ListLoadingSkeleton />
      ) : viewings.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-stone-500 dark:text-stone-300">
          No {filter || ''} viewings found.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {viewings.map(v => (
            <ViewingRow key={v.id} viewing={v} detailed />
          ))}
        </div>
      )}
    </div>
  );
}