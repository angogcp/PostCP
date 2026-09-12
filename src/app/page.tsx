'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import PostCard from '@/components/PostCard';
import QRModal from '@/components/QRModal';
import CreatePostModal from '@/components/CreatePostModal';
import { WardId, PostItem } from '@/types/post';
import staticPostsData from '@/data/posts.json';
import { FileQuestion, Inbox, Plus } from 'lucide-react';
import OfflineIndicator from '@/components/OfflineIndicator';
import OfflineModal from '@/components/OfflineModal';
import { registerServiceWorker } from '@/lib/offline-manager';
import {
  getAllCustomImages,
  getAllCustomPosts,
  saveCustomPost,
  deleteCustomPost,
} from '@/lib/image-store';

export default function HomePage() {
  // 初期区はデータが存在する3区を選択
  const [selectedWard, setSelectedWard] = useState<WardId>(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalPost, setActiveModalPost] = useState<PostItem | null>(null);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [customPosts, setCustomPosts] = useState<PostItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  // 初回マウント：SW登録、カスタム画像と新規登録ポストの取得
  useEffect(() => {
    registerServiceWorker();
    getAllCustomImages().then(setCustomImages);
    getAllCustomPosts().then(setCustomPosts);
  }, []);

  // 静的ポストとカスタムポストを合体（同一IDがあればカスタムを優先）
  const allPosts = useMemo(() => {
    const map = new Map<string, PostItem>();
    (staticPostsData as PostItem[]).forEach((p) => map.set(p.id, p));
    customPosts.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [customPosts]);

  // 新規ポストが作成された時の処理
  const handlePostCreated = async (newPost: PostItem, dataUrl: string) => {
    // クライアント側（IndexedDB）に保存
    await saveCustomPost(newPost, dataUrl);

    // State更新
    setCustomPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== newPost.id);
      return [...filtered, newPost];
    });

    setCustomImages((prev) => ({
      ...prev,
      [newPost.id]: dataUrl,
    }));

    // 登録したポストの区を表示
    setSelectedWard(newPost.ward as WardId);
  };

  // 画像置き換え更新時の処理
  const handleImageUpdated = (postId: string, dataUrl: string | null) => {
    setCustomImages((prev) => {
      const next = { ...prev };
      if (dataUrl) {
        next[postId] = dataUrl;
      } else {
        delete next[postId];
      }
      return next;
    });
  };

  // ポスト削除処理
  const handleDeletePost = async (postId: string) => {
    try {
      // サーバーAPI呼び出し
      await fetch('/api/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
    } catch (e) {
      console.warn('Server delete skipped', e);
    }

    // クライアント側から削除
    await deleteCustomPost(postId);
    setCustomPosts((prev) => prev.filter((p) => p.id !== postId));
    setCustomImages((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });

    setActiveModalPost(null);
  };

  // 各区の件数マップ
  const counts = useMemo(() => {
    const res: Record<WardId, number> = { 1: 0, 2: 0, 3: 0 };
    allPosts.forEach((p) => {
      if (p.ward in res) {
        res[p.ward as WardId]++;
      }
    });
    return res;
  }, [allPosts]);

  // 選択中の区のポスト一覧（番号順）
  const currentWardPosts = useMemo(() => {
    return allPosts
      .filter((p) => p.ward === selectedWard)
      .sort((a, b) => a.number - b.number);
  }, [allPosts, selectedWard]);

  // 検索クエリによる絞り込み（全角半角、ひらがな・カタカナ両対応）
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentWardPosts;
    }

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFKC')
        .replace(/[\u30a1-\u30f6]/g, (m) =>
          String.fromCharCode(m.charCodeAt(0) - 0x60)
        );

    const q = normalize(searchQuery.trim());

    return currentWardPosts.filter((post) => {
      const nameNorm = normalize(post.name);
      const addressNorm = post.address ? normalize(post.address) : '';
      const codeNorm = post.code ? post.code.toLowerCase() : '';
      const numStr = String(post.number);

      return (
        nameNorm.includes(q) ||
        addressNorm.includes(q) ||
        codeNorm.includes(q) ||
        numStr === q
      );
    });
  }, [currentWardPosts, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* オフライン状態通知バナー */}
      <OfflineIndicator />

      {/* ヘッダー */}
      <Header
        selectedWard={selectedWard}
        onSelectWard={(w) => {
          setSelectedWard(w);
          setSearchQuery(''); // 区を切り替えたら検索リセット
        }}
        counts={counts}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
      />

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 safe-bottom">
        {/* 検索バー */}
        <div className="mb-4">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            resultCount={filteredPosts.length}
            totalCount={currentWardPosts.length}
          />
        </div>

        {/* リスト表示 */}
        {currentWardPosts.length === 0 ? (
          // 該当区にデータが無い場合（1区・2区など）
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-1">
              第{selectedWard}区のポストはまだ登録されていません
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-5">
              下のボタンからポスト名とQRコード画像（写真撮影またはファイル選択）を登録できます。
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-postal-red hover:bg-postal-darkRed active:scale-95 text-white font-bold text-sm shadow-md shadow-red-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>第{selectedWard}区のポストを登録する</span>
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          // 検索でヒットしなかった場合
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-1">
              一致するポストが見つかりません
            </h2>
            <p className="text-xs text-slate-500">
              検索ワードを変更するか、クリアボタンを押してください
            </p>
          </div>
        ) : (
          // ポスト一覧
          <div className="space-y-2.5">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                customImage={customImages[post.id]}
                onOpenQR={(p) => setActiveModalPost(p)}
              />
            ))}

            {/* リスト末尾の追加ボタン */}
            <div className="pt-3 pb-6 text-center">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-postal-red hover:text-postal-red text-slate-500 font-bold text-xs transition active:scale-98 bg-white/50"
              >
                <Plus className="w-4 h-4" />
                <span>第{selectedWard}区に新しいポストを追加</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* QR表示モーダル */}
      <QRModal
        post={activeModalPost}
        postsList={filteredPosts.length > 0 ? filteredPosts : currentWardPosts}
        customImages={customImages}
        onClose={() => setActiveModalPost(null)}
        onSelectPost={(p) => setActiveModalPost(p)}
        onImageUpdated={handleImageUpdated}
        onDeletePost={handleDeletePost}
      />

      {/* 新規ポスト登録モーダル */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        defaultWard={selectedWard}
        existingPosts={allPosts}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* オフライン設定・一括保存モーダル */}
      <OfflineModal
        isOpen={isOfflineModalOpen}
        posts={allPosts}
        onClose={() => setIsOfflineModalOpen(false)}
      />
    </div>
  );
}
