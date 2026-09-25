'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  UnitDetailSkeleton,
  UnitNotFound,
  UnitHeader,
  VerificationWarning,
  VerificationSection,
  UnitDetailsCard,
  FacilitiesCard,
  PropertyCard,
  ListingMediaCard,
  VerificationHistoryCard,
  type Unit,
} from '@/components/accommodation/admin';

export default function AdminUnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUnit = useCallback(() => {
    fetch(`/api/admin/accommodation/units/${params.id}`)
      .then(r => r.json())
      .then(d => setUnit(d.unit))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    loadUnit();
  }, [loadUnit]);

  console.log(unit)

  if (loading) return <UnitDetailSkeleton />;

  if (!unit) return <UnitNotFound />;

  return (
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-background">
      <UnitHeader unit={unit} onBack={() => router.back()} />

      <div className="flex flex-col gap-3 p-4">
        <VerificationWarning unit={unit} />
        <VerificationSection unit={unit} onVerified={loadUnit} />
        <UnitDetailsCard unit={unit} />
        <FacilitiesCard unit={unit} />
        <PropertyCard unit={unit} />
        <ListingMediaCard unit={unit} />
        {unit.verifications && unit.verifications.length > 0 && (
          <VerificationHistoryCard verifications={unit.verifications} />
        )}
      </div>
    </div>
  );
}