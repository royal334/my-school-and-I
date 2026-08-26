'use client';

import { ThemeProvider } from 'next-themes';
import PostHogIdentify from "./posthog-identify";
import PostHogPageview from "./posthog-pageview";
import PostHogProvider from "./posthog-provider";
import { Suspense } from "react";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { getFirebaseServiceWorkerRegistration } from "@/utils/lib/notifications";
import { getFirebaseMessaging } from "@/utils/firebase/config";

function NotificationListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function listenForMessages() {
      if (Notification.permission !== "granted") return;

      try {
        const [messaging] = await Promise.all([
          getFirebaseMessaging(),
          getFirebaseServiceWorkerRegistration(),
        ]);

        if (messaging) {
          unsubscribe = onMessage(messaging, (payload) => {
            toast(payload.notification?.title || "New notification", {
              description: payload.notification?.body,
            });
          });
        }
      } catch (error) {
        console.error("Failed to initialize foreground notifications:", error);
      }
    }

    void listenForMessages();
    return () => unsubscribe?.();
  }, []);

  return null;
}

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
        <NotificationListener />
        {children}
      </ThemeProvider>
    </PostHogProvider>
  );
}
