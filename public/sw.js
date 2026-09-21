/*
 * M.C Marketplace — Service Worker V4.0.1
 * Purpose:
 * - Support browser notifications
 * - Handle notification clicks
 * - Keep network behavior unchanged
 * - No cache system enabled yet
 * - No payment logic
 * - No Firebase background messaging
 */

const SW_VERSION = "MC-MARKETPLACE-SW-V4.0.1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

/*
 * Network requests are intentionally passed through.
 * We do not introduce caching at this stage because the
 * marketplace does not currently define a cache strategy.
 */
self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});

/*
 * Handle clicks on notifications created with:
 * registration.showNotification(...)
 */
self.addEventListener("notificationclick", event => {
  event.notification.close();

  const data = event.notification?.data || {};
  const targetUrl = data.url || "index.html";

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {

      const absoluteUrl = new URL(targetUrl, self.location.origin).href;

      for (const client of clientList) {
        if ("focus" in client) {
          if (client.url === absoluteUrl) {
            return client.focus();
          }
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(absoluteUrl);
      }

      return undefined;
    }).catch(() => undefined)
  );
});
