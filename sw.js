// Service Worker for PWA offline support
const CACHE_NAME = 'bookshelf-app-v1';
const urlsToCache = [
  '/',
  '/index.html'
];

// インストールイベント
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(() => {
          // キャッシュ保存に失敗しても処理を続行
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

// アクティベーションイベント
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチイベント (ネットワークファーストで、失敗時キャッシュ)
self.addEventListener('fetch', event => {
  // GASへのリクエストはスキップ
  if (event.request.url.includes('script.google.com') || 
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 200ステータスのレスポンスのみキャッシュ
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // レスポンスをクローン
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから取得
        return caches.match(event.request)
          .then(response => {
            return response || new Response('オフラインです。インターネット接続を確認してください。', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// バックグラウンド同期 (オプション)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-books') {
    event.waitUntil(syncBooks());
  }
});

async function syncBooks() {
  try {
    // オフライン時に保存されたデータを同期
    // ここに実装を追加
  } catch (error) {
    console.error('同期エラー:', error);
  }
}
