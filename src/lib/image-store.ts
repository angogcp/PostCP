// IndexedDBを使った画像置き換え・新規ポスト登録管理
// Vercel本番（読み取り専用ファイルシステム）でもクライアント側で確実にデータを永続化し、
// ローカル環境ではサーバーファイルも同時に更新するハイブリッド管理

import { PostItem } from '@/types/post';

const DB_NAME = 'postcp_db';
const DB_VERSION = 2;
const STORE_IMAGES = 'custom_images';
const STORE_POSTS = 'custom_posts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_POSTS)) {
        db.createObjectStore(STORE_POSTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ================== 画像の置き換え用 ================== */

export async function saveCustomImage(postId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      const store = tx.objectStore(STORE_IMAGES);
      store.put({ id: postId, dataUrl, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save image in IndexedDB, fallback to localStorage', err);
    try {
      localStorage.setItem(`custom_img_${postId}`, dataUrl);
    } catch (e) {
      console.error('LocalStorage full', e);
    }
  }
}

export async function getAllCustomImages(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_IMAGES, 'readonly');
      const store = tx.objectStore(STORE_IMAGES);
      const req = store.getAll();
      req.onsuccess = () => {
        const result: Record<string, string> = {};
        if (Array.isArray(req.result)) {
          req.result.forEach((item) => {
            if (item.id && item.dataUrl) {
              result[item.id] = item.dataUrl;
            }
          });
        }
        resolve(result);
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

export async function removeCustomImage(postId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      const store = tx.objectStore(STORE_IMAGES);
      store.delete(postId);
      tx.oncomplete = () => {
        localStorage.removeItem(`custom_img_${postId}`);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`custom_img_${postId}`);
    }
  }
}

/* ================== 新規ポスト登録・管理用 ================== */

export async function saveCustomPost(post: PostItem, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_POSTS, STORE_IMAGES], 'readwrite');
      const postStore = tx.objectStore(STORE_POSTS);
      const imgStore = tx.objectStore(STORE_IMAGES);

      postStore.put(post);
      imgStore.put({ id: post.id, dataUrl, updatedAt: Date.now() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save post in IndexedDB', err);
    try {
      const existing = JSON.parse(localStorage.getItem('custom_posts_list') || '[]');
      const filtered = existing.filter((p: PostItem) => p.id !== post.id);
      filtered.push(post);
      localStorage.setItem('custom_posts_list', JSON.stringify(filtered));
      localStorage.setItem(`custom_img_${post.id}`, dataUrl);
    } catch (e) {
      console.error(e);
    }
  }
}

export async function getAllCustomPosts(): Promise<PostItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_POSTS, 'readonly');
      const store = tx.objectStore(STORE_POSTS);
      const req = store.getAll();
      req.onsuccess = () => {
        if (Array.isArray(req.result)) {
          resolve(req.result);
        } else {
          resolve([]);
        }
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('custom_posts_list') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  }
}

export async function deleteCustomPost(postId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_POSTS, STORE_IMAGES], 'readwrite');
      const postStore = tx.objectStore(STORE_POSTS);
      const imgStore = tx.objectStore(STORE_IMAGES);

      postStore.delete(postId);
      imgStore.delete(postId);

      tx.oncomplete = () => {
        if (typeof window !== 'undefined') {
          try {
            const existing = JSON.parse(localStorage.getItem('custom_posts_list') || '[]');
            const filtered = existing.filter((p: PostItem) => p.id !== postId);
            localStorage.setItem('custom_posts_list', JSON.stringify(filtered));
            localStorage.removeItem(`custom_img_${postId}`);
          } catch {}
        }
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete post from IndexedDB', err);
  }
}
