importScripts(
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: 'AIzaSyC5k1Q57XIa_k1l4AoJPYBDdMEG_iaucKs',
  authDomain: 'campushub-f6fd3.firebaseapp.com',
  projectId: 'campushub-f6fd3',
  storageBucket: 'campushub-f6fd3.firebasestorage.app',
  messagingSenderId: '846864364962',
  appId: '1:846864364962:web:a8d1e8beb9fb9e0eaf2efb',
});

const messaging = firebase.messaging();

// The SDK already raises an OS notification for the `notification` block of a
// background message. Adding onBackgroundMessage + showNotification here would
// render a duplicate popup for every push, so only click handling is added.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  // Without claim, a freshly installed worker does not control open tabs until
  // the next full navigation, which strands push delivery on first enable.
  event.waitUntil(self.clients.claim());
});

function resolveTargetUrl(event) {
  const data = event.notification && event.notification.data ? event.notification.data : {};
  const link = data.fcmOptions && data.fcmOptions.link;
  return typeof link === 'string' && link.length > 0 ? link : '/';
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = resolveTargetUrl(event);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Reuse an open tab on this origin so a click never opens a duplicate.
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          const destination = new URL(targetUrl, self.location.origin);
          if (client.url !== destination.href && 'navigate' in client) {
            return client.navigate(destination.href).then((navigated) =>
              navigated ? client.focus() : undefined
            );
          }
          return client.focus();
        }
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});