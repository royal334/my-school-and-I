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