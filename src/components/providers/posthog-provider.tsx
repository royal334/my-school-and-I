// components/providers/posthog-provider.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
    
    // Don't capture page views automatically, we'll do it manually
    capture_pageview: false,
    
    // Capture page leave events
    capture_pageleave: true,
    
    // Session recording
    session_recording: {
      // Sample 10% of sessions
     sampleRate: 0.1,
     //Sample 100% of sessions with errors
     // errorSampleRate: 1.0,
     //  // Record text in inputs (set to false if concerned about privacy)
     //  recordCanvas: false,
     //  maskAllInputs: false,
     //  maskAllText: false,
    },
    
    // Persistence
    persistence: 'localStorage+cookie',
    persistence_name: 'ph_unihub',
    
    // Session
    token: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    enable_recording_console_log: false,
  });
}

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}