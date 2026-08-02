'use client';

import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

type EventProperties = Record<string, string | number | boolean | undefined | null>;

export function usePostHogAnalytics() {
  const posthog = usePostHog();

  const track = useCallback((event: string, properties?: EventProperties) => {
    posthog?.capture(event, properties);
  }, [posthog]);

  return { track };
}