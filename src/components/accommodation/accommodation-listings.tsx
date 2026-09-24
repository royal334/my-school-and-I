'use client';

import { useCallback, useEffect, useState } from 'react';
import { House } from 'lucide-react';
import { ListingFilters } from '@/components/accommodation/listing-filters';
import { ListingResults } from '@/components/accommodation/listing-results';
import type { Listing } from '@/components/accommodation/types';

export function AccommodationListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [roomType, setRoomType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasWater, setHasWater] = useState(false);
  const [hasElectricity, setHasElectricity] = useState(false);
  const [hasSecurity, setHasSecurity] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roomType) params.set('room_type', roomType);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (hasWater) params.set('has_water', 'true');
      if (hasElectricity) params.set('has_electricity', 'true');
      if (hasSecurity) params.set('has_security', 'true');

      const res = await fetch(`/api/accommodation/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, roomType, minPrice, maxPrice, hasWater, hasElectricity, hasSecurity]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchListings(), 300);
    return () => clearTimeout(timeout);
  }, [fetchListings]);

  const hasActiveFilters = Boolean(roomType || minPrice || maxPrice || hasWater || hasElectricity || hasSecurity);
  const activeCount = [roomType, minPrice, maxPrice, hasWater, hasElectricity, hasSecurity].filter(Boolean).length;

  const clearFilters = () => {
    setRoomType('');
    setMinPrice('');
    setMaxPrice('');
    setHasWater(false);
    setHasElectricity(false);
    setHasSecurity(false);
  };

  return (
    <div  className="max-w-4xl mx-auto space-y-6">
      {/* Count pill */}
      {/* <div className="flex justify-end">
        <div className="flex items-center gap-2 rounded-lg border border-[#D6E5DF] bg-[#E8F5EF] px-4 py-2 dark:border-white/10 dark:bg-[#1E211F]">
          <House className="h-5 w-5 text-[#4A8C73] dark:text-[#7EC8A0]" />
          <span className="text-sm font-medium text-[#1A3C34] dark:text-[#E8F5EF]">
            {loading ? 'Loading…' : `${total} ${total === 1 ? 'listing' : 'listings'}`}
          </span>
        </div>
      </div> */}

      {/* Filters */}
      <ListingFilters
        search={search}
        onSearchChange={setSearch}
        roomType={roomType}
        onRoomTypeChange={setRoomType}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        hasWater={hasWater}
        onToggleWater={() => setHasWater(!hasWater)}
        hasElectricity={hasElectricity}
        onToggleElectricity={() => setHasElectricity(!hasElectricity)}
        hasSecurity={hasSecurity}
        onToggleSecurity={() => setHasSecurity(!hasSecurity)}
        hasActiveFilters={hasActiveFilters}
        activeCount={activeCount}
        onClearFilters={clearFilters}
      />

      {/* Results */}
      <ListingResults
        loading={loading}
        listings={listings}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}