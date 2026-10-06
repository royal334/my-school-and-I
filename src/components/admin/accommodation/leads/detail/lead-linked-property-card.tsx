import { Link2 } from 'lucide-react';
import Link from 'next/link';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import type { LeadDetail } from '@/components/admin/accommodation/types';
import { LeadCard } from './lead-card';

/** Confirmation that the approved submission has been turned into a live
 *  property/unit record. */
export function LeadLinkedPropertyCard({ lead }: { lead: LeadDetail }) {
  const { matched_property: property, matched_unit: unit } = lead;
  if (!property && !unit) return null;

  const label = unit?.unit_number || unit?.room_type;

  return (
    <LeadCard className="border-success/25 bg-success-bg dark:bg-success-bg">
      <SectionTitle>Linked property</SectionTitle>

      {property && (
        <Link
          href={`/admin/accommodation/units/${unit?.id ?? property.id}`}
          className="mt-1.5 flex items-center gap-1.5 rounded text-sm font-medium text-foreground transition-colors hover:text-primary-600 hover:underline dark:hover:text-primary-300"
        >
          <Link2 className="size-3.5 shrink-0 text-success" aria-hidden />
          {property.name} · {property.area}
        </Link>
      )}

      {label && <p className="mt-0.5 pl-5 text-[13px] text-muted-foreground">{label}</p>}
    </LeadCard>
  );
}