import PostHogIdentify from "./posthog-identify";
import PostHogPageview from "./posthog-pageview";
import PostHogProvider from "./posthog-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <PostHogPageview/>
      <PostHogIdentify/>
        {children}
    </PostHogProvider>
  );
}
