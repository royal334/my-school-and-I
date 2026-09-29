import type { Metadata } from 'next';
import { AdminListingDetailView } from '@/components/admin/marketplace/listing-detail/admin-listing-detail-view';

export const metadata: Metadata = {
  title: 'Admin · Listing',
};

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminListingDetailView listingId={id} />;
}
