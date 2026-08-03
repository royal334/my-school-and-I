import PostHogIdentify from "./posthog-identify";
import PostHogPageview from "./posthog-pageview";
import PostHogProvider from "./posthog-provider";
import { Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <Suspense>
        <PostHogPageview/>
    </Suspense>
      <PostHogIdentify/>
        {children}
    </PostHogProvider>
  );
}
