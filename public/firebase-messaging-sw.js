// public/firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging (PWA Push Notifications)
// This file MUST stay in /public root — do not move it.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ⚠️  Replace with your actual Firebase config values
firebase.initializeApp({
  apiKey:            "AIzaSyAklbgNZPsHTgFQs92BfpmiLSK8P2gabqA",
  authDomain:        "studio-1366792253-f2b2e.firebaseapp.com",
  projectId:         "studio-1366792253-f2b2e",
  storageBucket:     "studio-1366792253-f2b2e.firebasestorage.app",
  messagingSenderId: "631680623608",
  appId:             "1:631680623608:web:1ceda46a6015a479a7ac0d",
});

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'ILMNOOR', {
    body: body || 'Time for prayer 🕌',
    icon: icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'prayer-alarm',
    renotify: true,
    requireInteraction: true,
  });
});

// Handle notification click → open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
