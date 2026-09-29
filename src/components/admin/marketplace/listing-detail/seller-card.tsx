'use client';

import { SELLER_TYPE_OPTIONS } from '@/components/marketplace/constants';
import { Panel } from '../panel';
import { SectionTitle } from '../section-title';
import { InfoRow } from '../info-row';
import type { AdminListingDetail } from '../types';

export function SellerCard({ listing }: { listing: AdminListingDetail }) {
  const sellerType =
    SELLER_TYPE_OPTIONS.find((option) => option.key === listing.seller_type)?.label ??
    listing.seller_type;

  return (
    <Panel>
      <SectionTitle>Seller</SectionTitle>
      <InfoRow label="Name" value={listing.seller_name} />
      <InfoRow label="Type" value={sellerType} />
      <InfoRow label="User ID" value={listing.seller_id} />
    </Panel>
  );
}
