'use client';

import { useEffect, useState } from 'react';
import { FilterChips } from './filter-chips';
import { LeadRow } from './lead-row';
import { ListLoadingSkeleton } from './loading-skeleton';
import type { Lead } from './types';

const FILTERS = ['', 'pending', 'reviewing', 'approved', 'rejected', 'duplicate'];

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter
      ? `/api/admin/accommodation/leads?status=${filter}&limit=50`
      : '/api/admin/accommodation/leads?limit=50';

    fetch(url)
      .then(r => r.json())
      .then(d => setLeads(d.leads || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <FilterChips filters={FILTERS} value={filter} onChange={setFilter} formatLabel={f => f || 'All'} />

      {loading ? (
        <ListLoadingSkeleton />
      ) : leads.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-stone-500 dark:text-stone-300">
          No {filter || ''} leads found.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map(lead => (
            <LeadRow key={lead.id} lead={lead} submitterPrefix="by " />
          ))}
        </div>
      )}
    </div>
  );
}