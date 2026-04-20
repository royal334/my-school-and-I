"use client";

import { useMemo } from 'react';
import { 
  getVendorFeatures, 
  checkSubscriptionActive, 
  getBadges,
  type Vendor,
  type VendorTier,
  type VendorFeatures 
} from '@/utils/lib/vendor-features';

export type { Vendor, VendorTier, VendorFeatures };
export { checkSubscriptionActive, getBadges };

export function useVendorFeatures(vendor: Vendor): VendorFeatures {
  return useMemo(() => {
    return getVendorFeatures(vendor);
  }, [vendor]);
}
