'use client';

import { ThemeProvider } from 'next-themes';
import PostHogIdentify from "./posthog-identify";
import PostHogPageview from "./posthog-pageview";
import PostHogProvider from "./posthog-provider";
import { Suspense } from "react";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { createClient } from "@/utils/supabase/client";
import {
  ensureDeviceTokenSync,
  getFirebaseServiceWorkerRegistration,
  isPushSupported,
} from "@/utils/lib/notifications";
import { getFirebaseMessaging } from "@/utils/firebase/config";

function NotificationListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const userId = session?.user.id;
        if (userId) {
          window.setTimeout(() => ensureDeviceTokenSync(userId), 0);
        }
      },
    );

    async function listenForMessages() {
      if (!isPushSupported()) return;

      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const registration = await getFirebaseServiceWorkerRegistration();

        unsubscribe = onMessage(messaging, (payload) => {
          if (Notification.permission !== "granted") return;

          void registration
            .showNotification(payload.notification?.title || "Campus&Me", {
              body: payload.notification?.body,
              icon: "/campus-and-me-logo.png",
              badge: "/campus-and-me-logo.png",
              data: { fcmOptions: payload.fcmOptions ?? {} },
            })
            .catch((error) => {
              console.error("Failed to show foreground push notification:", error);
            });
        });
      } catch (error) {
        console.error("Failed to initialize foreground notifications:", error);
      }
    }

    void listenForMessages();
    return () => {
      unsubscribe?.();
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
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
