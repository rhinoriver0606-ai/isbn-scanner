const CACHE_NAME = "bookshelf-pwa-v1";

const CACHE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];

/* =========================
インストール（キャッシュ保存）
========================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

/* =========================
アクティベート（古いキャッシュ削除）
========================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

/* =========================
フェッチ（オフライン対応）
========================= */
self.addEventListener("fetch", event => {
  const req = event.request;

  // APIは常にネット優先（GASなど）
  if (req.url.includes("script.google.com") ||
      req.url.includes("googleapis.com")) {
    event.respondWith(fetch(req));
    return;
  }

  // それ以外はキャッシュ優先
  event.respondWith(
    caches.match(req).then(cacheRes => {
      return cacheRes || fetch(req);
    })
  );
});
