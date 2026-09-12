'use client';

import { useState, useEffect } from 'react';
import {
  X,
  DownloadCloud,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { PostItem } from '@/types/post';
import { precacheAllImages, getCacheStats, useOnlineStatus } from '@/lib/offline-manager';

interface OfflineModalProps {
  isOpen: boolean;
  posts: PostItem[];
  onClose: () => void;
}

export default function OfflineModal({ isOpen, posts, onClose }: OfflineModalProps) {
  const isOnline = useOnlineStatus();
  const [stats, setStats] = useState<{
    cachedCount: number;
    totalCount: number;
    lastCachedAt: string | null;
  }>({ cachedCount: 0, totalCount: posts.length, lastCachedAt: null });

  const [isCaching, setIsCaching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // モーダルオープン時にキャッシュ状況を取得
  useEffect(() => {
    if (isOpen) {
      getCacheStats(posts).then(setStats);
      setSuccessMsg(null);
    }
  }, [isOpen, posts]);

  // 一括キャッシュ実行
  const handleStartCache = async () => {
    setIsCaching(true);
    setSuccessMsg(null);

    try {
      await precacheAllImages(posts, (curr, tot) => {
        setProgress({ current: curr, total: tot });
      });

      const updated = await getCacheStats(posts);
      setStats(updated);
      setSuccessMsg('すべてのポストデータとQR画像を端末に保存しました！');
    } catch (err) {
      console.error(err);
      alert('キャッシュ保存中にエラーが発生しました');
    } finally {
      setIsCaching(false);
    }
  };

  if (!isOpen) return null;

  const percent =
    stats.totalCount > 0
      ? Math.round((stats.cachedCount / stats.totalCount) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* ヘッダー */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">
                オフラインモード設定
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                端末へのデータ保存・圏外対応
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-5 space-y-4">
          {/* 現在の接続状態 */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>接続状態: {isOnline ? 'オンライン（通信中）' : 'オフライン（圏外）'}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wide">
              {isOnline ? 'Active' : 'Offline'}
            </span>
          </div>

          {/* キャッシュ進行度カード */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">端末保存済みQRデータ</span>
              <span className="font-black text-slate-800">
                {stats.cachedCount} / {stats.totalCount} 件 ({percent}%)
              </span>
            </div>

            {/* プログレスバー */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>最終同期日時</span>
              <span>{stats.lastCachedAt || '未保存'}</span>
            </div>
          </div>

          {/* 成功メッセージ */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 説明文 */}
          <div className="text-xs text-slate-500 leading-relaxed space-y-1 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
            <p className="font-bold text-blue-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              現場収集時のオフライン動作について
            </p>
            <p className="text-[11px] text-blue-800/80">
              出発前に下のボタンで全データを端末に保存しておくと、電波が届かない場所（トンネル、地下、ビル谷間）でも一切途切れることなくQRコードの検索・表示が可能です。
            </p>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleStartCache}
            disabled={isCaching || !isOnline}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCaching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  端末へ保存中... ({progress.current}/{progress.total})
                </span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-4 h-4" />
                <span>全データを端末に保存（事前ダウンロード）</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
