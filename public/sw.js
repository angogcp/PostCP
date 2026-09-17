// PostCP Service Worker - オフライン対応キャッシュ
const CACHE_NAME = 'postcp-cache-v4';

// 必須キャッシュリスト
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
  '/favicon.ico',
  '/images/routes/weekday_bin2_3ku.jpg',
  '/images/routes/weekday_bin3_3ku.jpg',
  '/images/routes/weekday_special_3ku.jpg',
  '/images/routes/weekday_all_3ku.jpg',
];

// インストール時
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート時（古いキャッシュの削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// フェッチ処理（Stale-While-Revalidate / Cache First）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== self.location.origin) {
    return;
  }

  // APIリクエスト（ログイン等）はNetwork First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // オフライン時のフォールバック
        if (url.pathname === '/api/auth/status') {
          return new Response(JSON.stringify({ authenticated: true, offline: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ success: false, message: '現在オフラインです' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // QR画像・ルート便画像リクエストは Cache First
  if (url.pathname.startsWith('/qr/') || url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Next.jsの静的JS/CSS chunks (_next/static) は Cache First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          return (
            cachedResponse ||
            fetch(request).then((networkResponse) => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            })
          );
        });
      })
    );
    return;
  }

  // 通常のページナビゲーション (HTML) は Network First, 失敗時はCache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // ルートページのフォールバック
        return caches.match('/');
      })
  );
});

// クライアントからのメッセージ（全画像一括事前キャッシュ）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRECACHE_ALL') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        for (const u of urls) {
          try {
            const match = await cache.match(u);
            if (!match) {
              const res = await fetch(u);
              if (res.status === 200) {
                await cache.put(u, res);
              }
            }
          } catch (e) {
            console.warn('Precache failed for', u, e);
          }
        }
        // 完了をクライアントに通知
        event.source.postMessage({ type: 'PRECACHE_COMPLETE', count: urls.length });
      })
    );
  }
});
