'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Plus, Check, AlertCircle, Sparkles } from 'lucide-react';
import { WardId, WARDS, PostItem } from '@/types/post';
import QRCode from 'qrcode';

interface CreatePostModalProps {
  isOpen: boolean;
  defaultWard: WardId;
  existingPosts: PostItem[];
  onClose: () => void;
  onPostCreated: (newPost: PostItem, dataUrl: string) => void;
}

export default function CreatePostModal({
  isOpen,
  defaultWard,
  existingPosts,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const [ward, setWard] = useState<WardId>(defaultWard);
  const [number, setNumber] = useState<number>(1);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初期化
  useEffect(() => {
    if (isOpen) {
      setWard(defaultWard);
      calculateNextNumber(defaultWard);
      setName('');
      setCode('');
      setAddress('');
      setPreviewUrl(null);
      setSelectedFile(null);
      setError(null);
    }
  }, [isOpen, defaultWard]);

  const calculateNextNumber = (targetWard: WardId) => {
    const wardPosts = existingPosts.filter((p) => p.ward === targetWard);
    if (wardPosts.length === 0) {
      setNumber(1);
    } else {
      const maxNum = Math.max(...wardPosts.map((p) => p.number), 0);
      setNumber(maxNum + 1);
    }
  };

  const handleWardChange = (newWard: WardId) => {
    setWard(newWard);
    calculateNextNumber(newWard);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('画像サイズは15MB以下のものを選択してください');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ポスト名を入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalDataUrl = previewUrl;

      // 写真が選択されていない場合、管理番号からQRコードDataURLを自動生成
      if (!finalDataUrl) {
        const qrString = code.trim()
          ? `PST:01;CD1:${code.trim()};`
          : `POST:${ward}-${number}-${name.trim()}`;
        finalDataUrl = await QRCode.toDataURL(qrString, {
          margin: 1,
          width: 500,
        });
      }

      // サーバーAPI呼び出し用のFormData
      const formData = new FormData();
      formData.append('ward', String(ward));
      formData.append('number', String(number));
      formData.append('name', name.trim());
      formData.append('code', code.trim());
      formData.append('address', address.trim());

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        // 生成したQRコードのBlobを添付
        const resBlob = await fetch(finalDataUrl);
        const blob = await resBlob.blob();
        formData.append('file', blob, `qr-${ward}-${number}.png`);
      }

      const res = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      let createdPost: PostItem;
      if (res.ok && data.success && data.post) {
        createdPost = {
          ...data.post,
          code: code.trim() || undefined,
          address: address.trim() || undefined,
          qrContent: code.trim() ? `PST:01;CD1:${code.trim()};` : undefined,
        };
      } else {
        createdPost = {
          id: `${ward}-${number}`,
          ward,
          number,
          name: name.trim(),
          code: code.trim() || undefined,
          address: address.trim() || undefined,
          qrContent: code.trim() ? `PST:01;CD1:${code.trim()};` : undefined,
          imagePath: `/qr/${ward}/qr-${ward}-${number}.jpg`,
        };
      }

      // クライアント側（IndexedDB & 親State）に反映
      onPostCreated(createdPost, finalDataUrl);
      onClose();
    } catch (err) {
      console.error(err);
      setError('登録中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in safe-top safe-bottom">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* モーダルヘッダー */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-postal-red text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              新規ポスト・QRコード登録
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォームエリア */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 区の選択 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              収集区
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WARDS.map((w) => (
                <button
                  type="button"
                  key={w.id}
                  onClick={() => handleWardChange(w.id)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    ward === w.id
                      ? 'bg-postal-red text-white border-postal-red shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          {/* ポスト番号と名称 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                番号
              </label>
              <input
                type="number"
                min="1"
                required
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-red-200 focus:border-postal-red bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ポスト名（必須）
              </label>
              <input
                type="text"
                required
                placeholder="例: ○○郵便局前, △△商店"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-red-200 focus:border-postal-red bg-slate-50 focus:bg-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* 管理番号と所在地 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>管理番号 (CD1)</span>
                <span className="text-[10px] text-postal-red font-semibold">QR自動生成</span>
              </label>
              <input
                type="text"
                placeholder="例: 570101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-red-200 focus:border-postal-red bg-slate-50 focus:bg-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                所在地・住所
              </label>
              <input
                type="text"
                placeholder="例: 守口市 ○○町 1-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-red-200 focus:border-postal-red bg-slate-50 focus:bg-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* QR写真の添付（任意） */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>実物写真の添付</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {code ? '※ 未選択でも管理番号からQRを自動生成します' : '任意'}
              </span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative border border-slate-200 rounded-2xl p-2 bg-slate-50 flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="プレビュー"
                  className="max-h-40 w-auto object-contain rounded-xl shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs text-postal-red font-bold hover:underline flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>別の写真に変更する</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-postal-red rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50 hover:bg-red-50/20 flex flex-col items-center justify-center gap-1.5"
              >
                <Camera className="w-5 h-5 text-slate-400" />
                <div className="text-xs text-slate-600 font-medium">
                  実物の写真を撮影 または 画像を選択（任意）
                </div>
              </div>
            )}
          </div>

          {/* 登録ボタン */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-postal-red hover:bg-postal-darkRed active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-red-500/25 transition flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>ポストとQRコードを登録する</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
