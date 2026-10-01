'use client';

import { Library } from 'lucide-react';
import { FilterChips } from './filter-chips';
import { LoadingSkeleton } from './loading-skeleton';
import { EmptyState } from './empty-state';
import { LibraryRow } from './library-row';
import { LIBRARY_STATUS_FILTERS, getFilterLabel } from './constants';
import type { AdminMaterial } from './types';

export function LibraryTab({
  materials,
  loading,
  filter,
  onFilterChange,
  onChange,
}: {
  materials: AdminMaterial[];
  loading: boolean;
  filter: string;
  onFilterChange: (value: string) => void;
  onChange: (id: string, action: 'publish' | 'unpublish' | 'delete') => void;
}) {
  return (
    <div>
      <FilterChips
        filters={LIBRARY_STATUS_FILTERS}
        value={filter}
        onChange={onFilterChange}
        className="mb-3.5"
      />

      {loading ? (
        <LoadingSkeleton count={4} height={180} />
      ) : materials.length === 0 ? (
        <EmptyState
          icon={Library}
          title={`No ${getFilterLabel(filter).toLowerCase()} materials`}
          description="Upload a material or approve a student submission to populate the library."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {materials.map((material) => (
            <LibraryRow key={material.id} material={material} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}
