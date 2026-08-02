'use client';

import { useEffect } from 'react';
import { usePostHogAnalytics } from '@/hooks/posthog-events';
import { POSTHOG_EVENTS } from '@/utils/constants/constants';

interface VendorViewTrackerProps {
  vendorId: string;
  vendorName?: string;
  isOwner?: boolean;
}

export default function VendorViewTracker({
  vendorId,
  vendorName,
  isOwner = false,
}: VendorViewTrackerProps) {
  const { track } = usePostHogAnalytics();

  useEffect(() => {
    if (!vendorId || isOwner) return;

    track(POSTHOG_EVENTS.vendorViewed, {
      vendor_id: vendorId,
      vendor_name: vendorName,
    });
  }, [isOwner, track, vendorId, vendorName]);

  return null;
}
