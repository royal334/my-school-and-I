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
    console.log("This browser does not support notifications.");
    return null;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission was not granted.");
    return null;
  }

  console.log("Getting Firebase messaging...");
  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    console.log("Firebase Messaging is not supported.");
    return null;
  }
  console.log("Waiting for service worker...");
  const registration = await getFirebaseServiceWorkerRegistration();

  if (!registration.active) {
  throw new Error("Firebase service worker is not active.");
}
  console.log("Requesting FCM token...");

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  console.log("Notification token:", token);

  return token;
}