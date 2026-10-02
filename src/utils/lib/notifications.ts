"use client";

import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../firebase/config";

export async function getFirebaseServiceWorkerRegistration() {
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/" },
  );

  if (!registration.active) {
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Firebase service worker activation timed out")),
          10000,
        ),
      ),
    ]);
  }

  const activeRegistration = await navigator.serviceWorker.getRegistration("/");
  if (!activeRegistration?.active) {
    throw new Error("Firebase service worker is not active");
  }

  return activeRegistration;
}

export async function requestNotificationPermission() {
  if (!isPushSupported()) {
    return null;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return null;
  }

  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return null;
  }
  const registration = await getFirebaseServiceWorkerRegistration();

  if (!registration.active) {
    throw new Error("Firebase service worker is not active.");
  }

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return token;
}

export function isPushSupported(): boolean {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return false;
  }

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isInstalledApp =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return !isIOS || isInstalledApp;
}

export function isPushPermissionGranted(): boolean {
  return isPushSupported() && Notification.permission === "granted";
}

/**
 * Pushes the current FCM token to the server. The endpoint upserts by user and
 * token, so repeating this after sign-in or on a later load is safe.
 */
async function syncTokenToServer(token: string): Promise<void> {
  const response = await fetch("/api/notifications/register-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(`Failed to register device token (${response.status})`);
  }

}

/**
 * Reads the live FCM token and registers it for the currently authenticated user.
 *
 * FCM tokens rotate without warning and an outdated one fails permanently with
 * UNREGISTERED. Re-reading the token on every page load is what repairs rows
 * that already went stale in the database.
 *
 * Note: firebase v12 removed `onTokenRefresh` in favour of an FID-based API, so
 * per-load re-reading is the supported refresh mechanism for this token-based
 * pipeline. `getToken` resolves the current token from the IndexedDB-backed
 * push subscription, so it returns the rotated value rather than a cached one.
 */
async function runTokenSync(): Promise<void> {
  if (!isPushPermissionGranted()) return;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return;

  const registration = await getFirebaseServiceWorkerRegistration();
  if (!registration.active) return;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) return;

  await syncTokenToServer(token);
}

/**
 * Idempotent entry point for an authenticated user. The server upsert is
 * repeated on a later session so missing database rows can be repaired.
 */
const tokenSyncPromises = new Map<string, Promise<void>>();

export function ensureDeviceTokenSync(userId: string): void {
  if (typeof window === "undefined" || !userId || tokenSyncPromises.has(userId)) {
    return;
  }

  const syncPromise = runTokenSync()
    .catch((error) => {
      console.error("Device token sync failed:", error);
    })
    .finally(() => {
      tokenSyncPromises.delete(userId);
    });
  tokenSyncPromises.set(userId, syncPromise);
}

/**
 * Forces a fresh read of the FCM token and re-registers it, bypassing the
 * localStorage short-circuit. Used by the diagnostics UI.
 */
export async function forceTokenSync(): Promise<string | null> {
  if (!isPushPermissionGranted()) return null;

  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  const registration = await getFirebaseServiceWorkerRegistration();
  if (!registration.active) return null;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) return null;

  await syncTokenToServer(token);

  return token;
}

export interface PushDiagnostics {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  serviceWorkerSupported: boolean;
  firebaseSwActive: boolean;
  firebaseSwScope: string | null;
  pageControlledBy: string | null;
  pushSubscription: PushSubscription | null;
  currentToken: string | null;
  tokenInSync: boolean;
  error: string | null;
}

export async function collectPushDiagnostics(): Promise<PushDiagnostics> {
  const diagnostics: PushDiagnostics = {
    supported: isPushSupported(),
    permission:
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported",
    serviceWorkerSupported:
      typeof navigator !== "undefined" && "serviceWorker" in navigator,
    firebaseSwActive: false,
    firebaseSwScope: null,
    pageControlledBy: null,
    pushSubscription: null,
    currentToken: null,
    tokenInSync: false,
    error: null,
  };

  if (!diagnostics.serviceWorkerSupported) return diagnostics;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    diagnostics.firebaseSwActive = Boolean(registration?.active);
    diagnostics.firebaseSwScope = registration?.scope ?? null;
    diagnostics.pageControlledBy = navigator.serviceWorker.controller
      ?.scriptURL ?? null;

    if (registration?.pushManager) {
      diagnostics.pushSubscription = await registration.pushManager.getSubscription();
    }

    if (isPushPermissionGranted() && registration?.active) {
      const messaging = await getFirebaseMessaging();
      if (messaging) {
        diagnostics.currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        if (diagnostics.currentToken) {
          const response = await fetch("/api/notifications/register-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: diagnostics.currentToken,
              checkOnly: true,
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to verify the registered device token");
          }
          const result = await response.json();
          diagnostics.tokenInSync = result.registered === true;
        }
      }
    }
  } catch (error) {
    diagnostics.error =
      error instanceof Error ? error.message : "Failed to read push state";
  }

  return diagnostics;
}