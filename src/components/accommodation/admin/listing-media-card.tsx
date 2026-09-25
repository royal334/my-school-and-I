import type { Unit } from './types';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { ListingMediaUpload } from './listing-media-upload';

export function ListingMediaCard({ unit }: { unit: Unit }) {
  return (
    <Card>
      <SectionTitle>Listing photos (verified)</SectionTitle>
      <ListingMediaUpload unit={unit} />
    </Card>
  );
}