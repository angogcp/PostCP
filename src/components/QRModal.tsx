'use client';

import { useEffect, useState, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Camera,
  RotateCcw,
  Check,
  AlertCircle,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { PostItem } from '@/types/post';
import { saveCustomImage, removeCustomImage } from '@/lib/image-store';
import DigitalQRCard from './DigitalQRCard';

interface QRModalProps {
  post: PostItem | null;
  postsList: PostItem[];
  customImages: Record<string, string>;
  onClose: () => void;
  onSelectPost: (post: PostItem) => void;
  onImageUpdated: (postId: string, dataUrl: string | null) => void;
  onDeletePost?: (postId: string) => void;
}

export default function QRModal({
  post,
  postsList,
  customImages,
  onClose,
  onSelectPost,
  onImageUpdated,
  onDeletePost,
}: QRModalProps) {
  const [viewMode, setViewMode] = useState<'digital' | 'photo'>('digital');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);

  // 現在表示する画像（カスタム画像があればそちら、無ければ元の静的パス）
  const currentImageSrc = post
    ? customImages[post.id] || post.imagePath
    : '';
  const isCustomized = post ? Boolean(customImages[post.id]) : false;

  const currentIndex = post
    ? postsList.findIndex((p) => p.id === post.id)
    : -1;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < postsList.length - 1;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handlePrev = () => {
    if (hasPrev) {
      setIsZoomed(false);
      onSelectPost(postsList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setIsZoomed(false);
      onSelectPost(postsList[currentIndex + 1]);
    }
  };

  // 画像置き換え処理
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !post) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('画像サイズは15MB以下のものを選択してください');
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        await saveCustomImage(post.id, dataUrl);
        onImageUpdated(post.id, dataUrl);

        try {
          const formData = new FormData();
          formData.append('postId', post.id);
          formData.append('file', file);
          await fetch('/api/posts/replace-image', {
            method: 'POST',
            body: formData,
          });
        } catch (apiErr) {
          console.warn('Server sync skipped', apiErr);
        }

        setIsUploading(false);
        setViewMode('photo'); // 写真モードに切り替え
        showToast('QR写真を更新しました！');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('画像の更新に失敗しました');
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 初期画像に戻す
  const handleResetImage = async () => {
    if (!post) return;
    if (!confirm('このポストのQRコードを初期画像に戻しますか？')) return;

    await removeCustomImage(post.id);
    onImageUpdated(post.id, null);
    showToast('初期画像に戻しました');
  };

  // ポスト削除処理
  const handleDelete = async () => {
    if (!post || !onDeletePost) return;
    if (!confirm(`第${post.ward}区 No.${post.number}「${post.name}」を削除しますか？`)) return;

    onDeletePost(post.id);
  };

  // キーボード操作
  useEffect(() => {
    if (!post) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) handlePrev();
      if (e.key === 'ArrowRight' && hasNext) handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post, currentIndex, hasPrev, hasNext]);

  // モーダルオープン時のスクロール抑制
  useEffect(() => {
    if (post) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [post]);

  // スワイプ検知
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50 && hasNext) {
      handleNext();
    } else if (diff < -50 && hasPrev) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/92 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      {/* 隠しファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 通知トースト */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 上部バー */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <span className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-postal-red text-white text-sm font-black tracking-wide shadow-sm">
            No.{post.number}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold truncate leading-tight">
                {post.name}
              </h3>
              {isCustomized && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-medium">
                  写真差替済
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {post.ward}区 （{currentIndex + 1} / {postsList.length}）
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* 写真の差し替え */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-xl bg-slate-800 text-amber-300 hover:text-white hover:bg-slate-700 active:scale-95 transition flex items-center gap-1 text-xs"
            title="現場写真の撮影/差し替え"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">写真変更</span>
          </button>

          {/* 差替済みならリセットボタン */}
          {isCustomized && (
            <button
              onClick={handleResetImage}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition"
              title="初期写真に戻す"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* ポスト削除ボタン */}
          {onDeletePost && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-slate-800 text-red-400 hover:text-red-300 hover:bg-red-900/30 active:scale-95 transition"
              title="このポストを削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* ズーム切り替え */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition"
            title={isZoomed ? '通常サイズ' : '拡大表示'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition"
            title="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 収集予定時刻バナー */}
      {post.schedule?.weekday && (
        <div className="w-full max-w-sm mx-auto pt-2 px-4">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-bold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-postal-red" />
              収集時刻:
            </span>
            <div className="flex items-center gap-2 font-mono">
              {post.schedule.weekday.bin2 && (
                <span className="text-blue-300 font-bold">
                  2号 {post.schedule.weekday.bin2}
                </span>
              )}
              {post.schedule.weekday.bin3 && (
                <span className="text-emerald-300 font-bold">
                  3号 {post.schedule.weekday.bin3}
                </span>
              )}
              {post.schedule.weekday.special && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-black border border-amber-500/40">
                  特便 {post.schedule.weekday.special}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* モード切り替えタブ（高精細デジタルQR vs 現地写真） */}
      <div className="w-full max-w-xs mx-auto pt-2 px-4">
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl text-xs font-bold border border-slate-700">
          <button
            onClick={() => setViewMode('digital')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              viewMode === 'digital'
                ? 'bg-postal-red text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>高精細QR</span>
          </button>
          <button
            onClick={() => setViewMode('photo')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              viewMode === 'photo'
                ? 'bg-postal-red text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>実物写真</span>
          </button>
        </div>
      </div>

      {/* 中央：QRコード表示エリア */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {viewMode === 'digital' ? (
          // 高精細デジタル再生成カード
          <div className={`w-full transition-all duration-200 ${isZoomed ? 'max-w-xl scale-105' : 'max-w-md'}`}>
            <DigitalQRCard post={post} isZoomed={isZoomed} />
          </div>
        ) : (
          // 実物写真
          <div
            onClick={() => setIsZoomed(!isZoomed)}
            className={`relative bg-white rounded-2xl p-3 shadow-2xl transition-all duration-200 cursor-pointer max-w-full flex items-center justify-center ${
              isZoomed ? 'w-full max-w-lg scale-105' : 'w-full max-w-md'
            }`}
          >
            {isUploading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
                <div className="w-8 h-8 border-3 border-postal-red border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold">画像を更新中...</span>
              </div>
            ) : (
              <img
                src={currentImageSrc}
                alt={`${post.name} QRコード写真`}
                className="w-full h-auto max-h-[55vh] object-contain rounded-xl select-none"
                loading="eager"
              />
            )}

            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 opacity-80 pointer-events-none">
              <Maximize2 className="w-3 h-3" />
              <span>{isZoomed ? 'タップで縮小' : 'タップで拡大'}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-3 text-slate-400 text-xs font-medium">
          <span>左右スワイプで前後に切替</span>
          {viewMode === 'digital' ? (
            <>
              <span>•</span>
              <button
                onClick={() => setViewMode('photo')}
                className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
              >
                実物写真を見る
              </button>
            </>
          ) : (
            <>
              <span>•</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
              >
                写真を撮り直す
              </button>
            </>
          )}
        </div>
      </div>

      {/* 下部：ナビゲーションバー */}
      <div className="w-full bg-slate-900/95 border-t border-slate-800 p-3 flex items-center justify-between gap-3 max-w-md mx-auto">
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>前のポスト</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!hasNext}
          className="flex-1 py-3 px-4 rounded-xl bg-postal-red hover:bg-postal-darkRed active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>次のポスト</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
