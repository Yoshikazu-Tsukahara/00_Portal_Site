/* 旧ルート互換用。新規インストールは /lunch-savings/sw.js を使用 */
const CACHE_NAME = "my-toolbox-v1-legacy";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister()),
  );
});
