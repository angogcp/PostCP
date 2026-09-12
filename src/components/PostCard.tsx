'use client';

import { QrCode, ChevronRight, Check } from 'lucide-react';
import { PostItem } from '@/types/post';

interface PostCardProps {
  post: PostItem;
  customImage?: string;
  onOpenQR: (post: PostItem) => void;
}

export default function PostCard({ post, customImage, onOpenQR }: PostCardProps) {
  const isCustomized = Boolean(customImage);

  return (
    <div
      onClick={() => onOpenQR(post)}
      className="group relative flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-red-300 hover:shadow-md active:scale-[0.985] active:bg-slate-50 transition cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        {/* 番号バッジ */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-red-50 group-hover:text-postal-red flex items-center justify-center font-black text-base transition-colors border border-slate-200/60">
          {post.number}
        </div>

        {/* ポスト名 */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-slate-800 group-hover:text-postal-red truncate transition-colors leading-snug">
              {post.name}
            </h2>
            {isCustomized && (
              <span className="flex-shrink-0 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-md font-semibold">
                差替済
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            {post.code ? `[${post.code}] ` : ''}{post.address ? post.address : `第${post.ward}区 ・ No.${post.number}`}
          </p>
        </div>
      </div>

      {/* アクション表示（QRアイコン＋矢印） */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-postal-red flex items-center justify-center transition group-hover:scale-110">
          <QrCode className="w-5 h-5" />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}
