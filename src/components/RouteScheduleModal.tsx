'use client';

import { useState } from 'react';
import { X, Calendar, QrCode, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { PostItem } from '@/types/post';
import { WARD_ROUTES } from '@/data/routes';

interface RouteScheduleModalProps {
  isOpen: boolean;
  ward: number;
  posts: PostItem[];
  onClose: () => void;
  onOpenPostQR: (post: PostItem) => void;
  onOpenRouteQR: (shiftId: string) => void;
}

export default function RouteScheduleModal({
  isOpen,
  ward,
  posts,
  onClose,
  onOpenPostQR,
  onOpenRouteQR,
}: RouteScheduleModalProps) {
  const [dayType, setDayType] = useState<'weekday' | 'holiday'>('weekday');
  const routeData = WARD_ROUTES[ward];
  const shifts = routeData?.weekday || [];

  if (!isOpen) return null;

  // 3区のポスト（番号順）
  const wardPosts = posts
    .filter((p) => p.ward === ward)
    .sort((a, b) => a.number - b.number);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-postal-red flex items-center justify-center border border-red-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                第{ward}区 郵便ポスト収集時刻表
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  平日ダイヤ
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                1日3回収集（2号便・3号便・特便）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 active:scale-95 flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 便開始QRコード クイックアクセスボタン */}
        <div className="p-3 sm:px-5 bg-slate-100/70 border-b border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-postal-red" />
              便開始用QRコード（スキャン用）
            </span>
            <span className="text-[11px] text-slate-400">タップで大型表示</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {shifts.map((shift) => (
              <button
                key={shift.id}
                onClick={() => onOpenRouteQR(shift.id)}
                className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-left transition shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 group-hover:text-postal-red">
                    {shift.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-postal-red" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                  {shift.timeRange}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 時刻表テーブル */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">No.</th>
                  <th className="py-2.5 px-3">ポスト名称</th>
                  <th className="py-2.5 px-2 text-center bg-blue-50/70 text-blue-900 border-l border-r border-blue-100/60">
                    2号便
                  </th>
                  <th className="py-2.5 px-2 text-center bg-emerald-50/70 text-emerald-900 border-r border-emerald-100/60">
                    3号便
                  </th>
                  <th className="py-2.5 px-2 text-center bg-amber-50/70 text-amber-900">
                    特便
                  </th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {wardPosts.map((post) => {
                  const schedule = post.schedule?.weekday;
                  const hasSpecial = Boolean(schedule?.special);

                  return (
                    <tr
                      key={post.id}
                      onClick={() => {
                        onClose();
                        onOpenPostQR(post);
                      }}
                      className="hover:bg-red-50/50 cursor-pointer transition active:bg-red-100/60 group"
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500 group-hover:text-postal-red">
                        {post.number}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 group-hover:text-postal-red truncate max-w-[140px] sm:max-w-[200px]">
                        {post.name}
                        {post.code && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            [{post.code}]
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-700 bg-blue-50/20 group-hover:bg-transparent">
                        {schedule?.bin2 || '—'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/20 group-hover:bg-transparent">
                        {schedule?.bin3 || '—'}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold group-hover:bg-transparent">
                        {hasSpecial ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-black">
                            {schedule?.special}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-postal-red inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 text-center">
            ※ 行をタップするとポストのQRコードが表示されます
          </p>
        </div>

        {/* フッター */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            全{wardPosts.length}箇所（パナソニック電工私設除外済）
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
