'use client';

import { useState } from 'react';
import { FilterChips } from './filter-chips';
import { UnitRow } from './unit-row';
import { formatPrice } from './utils';
import type { Unit } from './types';

const FILTERS = ['available', 'pending_reverification', 'unavailable', 'rented', 'expired', ''];

export function ListingsTab({ units, onVerified }: { units: Unit[]; onVerified: () => void }) {
  const [filter, setFilter] = useState('available');

  const oldestFirst = [...units].sort((left, right) => {
    const leftDate = left.submission_created_at || left.created_at || '';
    const rightDate = right.submission_created_at || right.created_at || '';
    if (!leftDate) return rightDate ? 1 : 0;
    if (!rightDate) return -1;
    return leftDate.localeCompare(rightDate);
  });
  const filtered = filter
    ? oldestFirst.filter(unit => unit.availability_status === filter)
    : oldestFirst;

  return (
    <div>
      <FilterChips
        filters={FILTERS}
        value={filter}
        onChange={setFilter}
        formatLabel={f => (f ? f.replace(/_/g, ' ') : 'All')}
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-stone-500 dark:text-stone-300">
          No listings with this status.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(u => (
            <UnitRow key={u.id} unit={u} formatPrice={formatPrice} onVerified={onVerified} />
          ))}
        </div>
      )}
    </div>
  );
}