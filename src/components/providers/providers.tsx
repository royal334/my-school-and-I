'use client';

import { ThemeProvider } from 'next-themes';
import PostHogIdentify from "./posthog-identify";
import PostHogPageview from "./posthog-pageview";
import PostHogProvider from "./posthog-provider";
import { Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Suspense fallback={null}><PostHogPageview/></Suspense>
        <PostHogIdentify/>
        {children}
      </ThemeProvider>
    </PostHogProvider>
  );
}
