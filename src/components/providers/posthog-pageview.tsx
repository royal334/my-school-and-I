'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export default function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }

      // Capture pageview with metadata
      posthog.capture('$pageview', {
        $current_url: url,
        path: pathname,
        search: searchParams.toString(),
      });

      // Optional: Track specific page types
      if (pathname.includes('/announcements')) {
        posthog.capture('page_announcements_viewed', {
          path: pathname,
          type: pathname.includes('/send') ? 'create' : 'feed',
        });
      }

      if (pathname.includes('/vendors')) {
        posthog.capture('page_vendors_viewed', {
          path: pathname,
        });
      }

      if (pathname.includes('/dashboard')) {
        posthog.capture('page_dashboard_viewed', {
          path: pathname,
        });
      }
    }
  }, [pathname, searchParams, posthog]);

  return null;
}