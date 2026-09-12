'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { PostItem } from '@/types/post';
import { Sparkles, MapPin, Hash } from 'lucide-react';

interface DigitalQRCardProps {
  post: PostItem;
  isZoomed: boolean;
}

export default function DigitalQRCard({ post, isZoomed }: DigitalQRCardProps) {
  const [svgString, setSvgString] = useState<string>('');

  // QRコードの内容（qrContentがあればそれ、無ければcodeから生成、どちらも無ければID）
  const qrData =
    post.qrContent ||
    (post.code ? `PST:01;CD1:${post.code};` : `POST:${post.ward}-${post.number}-${post.name}`);

  useEffect(() => {
    QRCode.toString(
      qrData,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, string) => {
        if (!err && string) {
          setSvgString(string);
        }
      }
    );
  }, [qrData]);

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border-4 border-postal-red/90 flex flex-col items-center select-none text-slate-800">
      {/* プレート風ヘッダー */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-postal-red text-white flex items-center justify-center font-bold text-xs">
            〒
          </span>
          <span className="text-xs font-black tracking-wider text-slate-500 uppercase">
            収集チェックポイント (高精細デジタル再生成)
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" /> 鮮明度 100%
        </span>
      </div>

      {/* メイン部：QRコード（左）＋付随情報（右） レイアウト */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-5 justify-center">
        {/* ベクターQRコード */}
        <div
          className={`flex-shrink-0 bg-white p-2 rounded-xl border-2 border-slate-200 shadow-inner flex items-center justify-center transition-all duration-200 ${
            isZoomed ? 'w-64 h-64 sm:w-72 sm:h-72' : 'w-48 h-48 sm:w-56 sm:h-56'
          }`}
          dangerouslySetInnerHTML={{ __html: svgString }}
        />

        {/* 付随情報（プレート表記の再現） */}
        <div className="flex-1 min-w-0 text-left space-y-3 w-full sm:w-auto">
          {/* 管理番号 (CD1) */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>管理番号</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
              {post.code || '未登録'}
            </div>
          </div>

          {/* ポスト名 */}
          <div>
            <div className="text-[11px] font-bold text-slate-400">
              ポスト名称
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
              {post.name}
            </div>
          </div>

          {/* 所在地・住所 */}
          {post.address && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>所在地</span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600">
                {post.address}
              </div>
            </div>
          )}

          <div className="pt-1 text-[10px] text-slate-400">
            第{post.ward}区 ・ ポストNo.{post.number}
          </div>
        </div>
      </div>
    </div>
  );
}
