import { cn } from '@/lib/utils';
import type { Unit } from './types';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';

export function FacilitiesCard({ unit }: { unit: Unit }) {
  const facilities = [
    { label: 'Water', val: unit.has_water },
    { label: 'Electricity', val: unit.has_electricity },
    { label: 'Security', val: unit.has_security },
    { label: 'Parking', val: unit.has_parking },
    { label: 'Furnished', val: unit.is_furnished },
  ];

  return (
    <Card>
      <SectionTitle>Facilities</SectionTitle>
      {facilities.map(({ label, val }) => (
        <div
          key={label}
          className="flex items-center justify-between border-b border-[#D6E5DF]/70 py-2 dark:border-white/10"
        >
          <span className="text-xs text-stone-500 dark:text-stone-300">{label}</span>
          <span className={cn('text-[13px] font-medium', val ? 'text-success' : 'text-error')}>
            {val ? 'Yes' : 'No'}
          </span>
        </div>
      ))}
    </Card>
  );
}