'use client';

import { useEffect, useState } from 'react';
import { PostItem } from '@/types/post';

const CACHE_NAME = 'postcp-cache-v7';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] Registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    });
  }
}

/**
 * 全QRコード画像および主要ページを一括事前キャッシュする
 */
export async function precacheAllImages(
  posts: PostItem[],
  onProgress?: (completed: number, total: number) => void
): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return 0;
  }

  const routeUrls = [
    '/images/routes/weekday_bin2_3ku.jpg',
    '/images/routes/weekday_bin3_3ku.jpg',
    '/images/routes/weekday_special_3ku.jpg',
    '/images/routes/weekday_all_3ku.jpg',
    '/images/routes/holiday_bin2_3ku.jpg',
    '/images/routes/holiday_bin3_3ku.jpg',
    '/images/routes/holiday_all_3ku.jpg',
  ];

  const urlsToCache = [
    '/',
    '/manifest.json',
    '/icons/icon.svg',
    ...routeUrls,
    ...posts.map((p) => p.imagePath).filter(Boolean),
  ];

  const total = urlsToCache.length;
  let completed = 0;

  const cache = await caches.open(CACHE_NAME);

  for (const url of urlsToCache) {
    try {
      const match = await cache.match(url);
      if (!match) {
        const res = await fetch(url, { cache: 'reload' });
        if (res.status === 200) {
          await cache.put(url, res);
        }
      }
    } catch (err) {
      console.warn('Cache error for', url, err);
    }
    completed++;
    if (onProgress) {
      onProgress(completed, total);
    }
  }

  localStorage.setItem('postcp_cached_time', new Date().toLocaleString('ja-JP'));
  return completed;
}

/**
 * キャッシュ状況を取得
 */
export async function getCacheStats(posts: PostItem[]): Promise<{
  cachedCount: number;
  totalCount: number;
  lastCachedAt: string | null;
}> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { cachedCount: 0, totalCount: posts.length, lastCachedAt: null };
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    let cachedCount = 0;

    for (const post of posts) {
      const match = await cache.match(post.imagePath);
      if (match) {
        cachedCount++;
      }
    }

    const lastCachedAt = localStorage.getItem('postcp_cached_time');
    return {
      cachedCount,
      totalCount: posts.length,
      lastCachedAt,
    };
  } catch {
    return { cachedCount: 0, totalCount: posts.length, lastCachedAt: null };
  }
}

/**
 * オンライン/オフライン状態フック
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
