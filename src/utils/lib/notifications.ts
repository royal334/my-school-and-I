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
  if (!("Notification" in window)) {
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