'use client';

import { Calendar, Clock, QrCode, FileText } from 'lucide-react';
import { RouteShift, WARD_ROUTES } from '@/data/routes';

export type ShiftFilter = 'all' | 'bin2' | 'bin3' | 'special';

interface ScheduleFilterBarProps {
  ward: number;
  currentShift: ShiftFilter;
  onSelectShift: (shift: ShiftFilter) => void;
  onOpenScheduleModal: () => void;
  onOpenRouteQR: (shiftId: string) => void;
  hasScheduleData: boolean;
}

export default function ScheduleFilterBar({
  ward,
  currentShift,
  onSelectShift,
  onOpenScheduleModal,
  onOpenRouteQR,
  hasScheduleData,
}: ScheduleFilterBarProps) {
  if (!hasScheduleData) {
    return null;
  }

  const routeData = WARD_ROUTES[ward];
  const shifts = routeData?.weekday || [];

  return (
    <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs mb-3">
      {/* 上部: 平日モード表示 & 時刻表ボタン */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-postal-red font-black text-xs">
            <Clock className="w-3 h-3" />
            平日ダイヤ
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            便を選択して絞り込み
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 便開始QR（現在選択中の便、または全便） */}
          {currentShift !== 'all' && (
            <button
              onClick={() => onOpenRouteQR(currentShift)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition"
              title="便開始QRコードを表示"
            >
              <QrCode className="w-3 h-3" />
              <span>
                {currentShift === 'bin2' ? '2号便' : currentShift === 'bin3' ? '3号便' : '特便'} 開始QR
              </span>
            </button>
          )}

          {/* 時刻表モーダル表示 */}
          <button
            onClick={onOpenScheduleModal}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition"
            title="収集時刻表全体を開く"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span>時刻表一覧</span>
          </button>
        </div>
      </div>

      {/* 便切り替えピルボタン */}
      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={() => onSelectShift('all')}
          className={`py-1.5 px-1 rounded-xl text-xs font-bold transition text-center flex flex-col items-center justify-center ${
            currentShift === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>すべて</span>
          <span className="text-[9px] opacity-75 font-normal">全28件</span>
        </button>

        <button
          onClick={() => onSelectShift('bin2')}
          className={`py-1.5 px-1 rounded-xl text-xs font-bold transition text-center flex flex-col items-center justify-center ${
            currentShift === 'bin2'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100'
          }`}
        >
          <span>2号便</span>
          <span className="text-[9px] opacity-80 font-normal">10:10〜</span>
        </button>

        <button
          onClick={() => onSelectShift('bin3')}
          className={`py-1.5 px-1 rounded-xl text-xs font-bold transition text-center flex flex-col items-center justify-center ${
            currentShift === 'bin3'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
          }`}
        >
          <span>3号便</span>
          <span className="text-[9px] opacity-80 font-normal">14:10〜</span>
        </button>

        <button
          onClick={() => onSelectShift('special')}
          className={`py-1.5 px-1 rounded-xl text-xs font-bold transition text-center flex flex-col items-center justify-center ${
            currentShift === 'special'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-black'
          }`}
        >
          <span>特便</span>
          <span className="text-[9px] opacity-80 font-normal">4局のみ</span>
        </button>
      </div>
    </div>
  );
}
