'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, QrCode, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { PostItem } from '@/types/post';
import { WARD_ROUTES } from '@/data/routes';

interface RouteScheduleModalProps {
  isOpen: boolean;
  ward: number;
  posts: PostItem[];
  initialDayType?: 'weekday' | 'holiday';
  onClose: () => void;
  onOpenPostQR: (post: PostItem) => void;
  onOpenRouteQR: (shiftId: string, day?: 'weekday' | 'holiday') => void;
}

export default function RouteScheduleModal({
  isOpen,
  ward,
  posts,
  initialDayType = 'weekday',
  onClose,
  onOpenPostQR,
  onOpenRouteQR,
}: RouteScheduleModalProps) {
  const [dayType, setDayType] = useState<'weekday' | 'holiday'>(initialDayType);

  // モーダルが開かれた時に外側のdayTypeと同期
  useEffect(() => {
    if (isOpen) {
      setDayType(initialDayType);
    }
  }, [isOpen, initialDayType]);

  const routeData = WARD_ROUTES[ward];
  const isHoliday = dayType === 'holiday';
  const shifts = isHoliday
    ? routeData?.holiday || []
    : routeData?.weekday || [];

  if (!isOpen) return null;

  // 3区のポスト（番号順）
  // 平日ダイヤの場合はweekday時刻があるもの（1〜28番）、土日祝ダイヤの場合は全件（1〜30番）
  const wardPosts = posts
    .filter((p) => p.ward === ward)
    .filter((p) => (isHoliday ? Boolean(p.schedule?.holiday) : Boolean(p.schedule?.weekday)))
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
              </h3>
              <p className="text-xs text-slate-500">
                {isHoliday
                  ? '土日祝：1日2回収集（2号便・3号便のみ / 特便なし）'
                  : '平日：1日3回収集（2号便・3号便・特便）'}
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

        {/* ダイヤ切り替えタブ */}
        <div className="px-5 pt-3 pb-2 bg-white flex items-center justify-between border-b border-slate-100">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 w-full sm:w-auto">
            <button
              onClick={() => setDayType('weekday')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                !isHoliday
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-postal-red" />
              <span>平日ダイヤ (全28件)</span>
            </button>
            <button
              onClick={() => setDayType('holiday')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isHoliday
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>土日祝ダイヤ (全30件)</span>
            </button>
          </div>
        </div>

        {/* 便開始QRコード クイックアクセスボタン */}
        <div className="p-3 sm:px-5 bg-slate-100/70 border-b border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-postal-red" />
              {isHoliday ? '土日祝 便開始QRコード' : '平日 便開始QRコード'}
            </span>
            <span className="text-[11px] text-slate-400">タップで大型表示</span>
          </div>
          <div className={`grid ${isHoliday ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
            {shifts.map((shift) => (
              <button
                key={shift.id}
                onClick={() => onOpenRouteQR(shift.id, dayType)}
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
                  <th className={`py-2.5 px-2 text-center bg-emerald-50/70 text-emerald-900 ${!isHoliday ? 'border-r border-emerald-100/60' : ''}`}>
                    3号便
                  </th>
                  {!isHoliday && (
                    <th className="py-2.5 px-2 text-center bg-amber-50/70 text-amber-900">
                      特便
                    </th>
                  )}
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {wardPosts.map((post) => {
                  const schedule = isHoliday ? post.schedule?.holiday : post.schedule?.weekday;
                  const hasSpecial = !isHoliday && Boolean(schedule?.special);
                  const isNewHolidayPost = isHoliday && (post.number === 29 || post.number === 30);

                  return (
                    <tr
                      key={post.id}
                      onClick={() => {
                        onClose();
                        onOpenPostQR(post);
                      }}
                      className={`hover:bg-red-50/50 cursor-pointer transition active:bg-red-100/60 group ${
                        isNewHolidayPost ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500 group-hover:text-postal-red">
                        {post.number}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 group-hover:text-postal-red truncate max-w-[140px] sm:max-w-[200px]">
                        <div className="flex items-center gap-1">
                          <span>{post.name}</span>
                          {isNewHolidayPost && (
                            <span className="text-[9px] px-1 rounded bg-red-100 text-red-700 font-bold">
                              土日祝追加
                            </span>
                          )}
                        </div>
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
                      {!isHoliday && (
                        <td className="py-2.5 px-2 text-center font-mono font-bold group-hover:bg-transparent">
                          {hasSpecial ? (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-black">
                              {schedule?.special}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      )}
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
            {isHoliday
              ? `全${wardPosts.length}箇所（土日祝追加: 29番・30番含む）`
              : `全${wardPosts.length}箇所（パナソニック電工私設除外済）`}
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
