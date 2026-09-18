'use client';

import { Calendar, Clock, QrCode, FileText } from 'lucide-react';
import { RouteShift, WARD_ROUTES } from '@/data/routes';

export type ShiftFilter = 'all' | 'bin2' | 'bin3' | 'special';
export type DayType = 'weekday' | 'holiday';

interface ScheduleFilterBarProps {
  ward: number;
  dayType: DayType;
  onSelectDayType: (day: DayType) => void;
  currentShift: ShiftFilter;
  onSelectShift: (shift: ShiftFilter) => void;
  onOpenScheduleModal: () => void;
  onOpenRouteQR: (shiftId: string) => void;
  hasScheduleData: boolean;
}

export default function ScheduleFilterBar({
  ward,
  dayType,
  onSelectDayType,
  currentShift,
  onSelectShift,
  onOpenScheduleModal,
  onOpenRouteQR,
  hasScheduleData,
}: ScheduleFilterBarProps) {
  if (!hasScheduleData) {
    return null;
  }

  const isHoliday = dayType === 'holiday';

  return (
    <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs mb-3">
      {/* 上部: ダイヤ種別切り替えタブ & 開始QR & 時刻表ボタン */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 gap-1.5">
        {/* 平日 / 土日祝 切り替えピル */}
        <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
          <button
            onClick={() => onSelectDayType('weekday')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              !isHoliday
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3 h-3 text-postal-red" />
            <span>平日ダイヤ</span>
          </button>
          <button
            onClick={() => onSelectDayType('holiday')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              isHoliday
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3 h-3 text-white" />
            <span>土日祝ダイヤ</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* 便開始QR（現在選択中の便） */}
          {currentShift !== 'all' && (currentShift !== 'special' || !isHoliday) && (
            <button
              onClick={() => onOpenRouteQR(currentShift)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition"
              title={`${isHoliday ? '休日' : '平日'}便開始QRコードを表示`}
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
            <span className="hidden sm:inline">時刻表一覧</span>
            <span className="sm:hidden">時刻表</span>
          </button>
        </div>
      </div>

      {/* 便切り替えピルボタン */}
      {isHoliday ? (
        // 土日祝用（特便なし・3カラム）
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onSelectShift('all')}
            className={`py-1.5 px-1 rounded-xl text-xs font-bold transition text-center flex flex-col items-center justify-center ${
              currentShift === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>すべて</span>
            <span className="text-[9px] opacity-75 font-normal">全30件 (29・30含む)</span>
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
            <span className="text-[9px] opacity-80 font-normal">10:00〜12:05</span>
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
            <span className="text-[9px] opacity-80 font-normal">15:00〜17:05</span>
          </button>
        </div>
      ) : (
        // 平日用（特便あり・4カラム）
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
      )}
    </div>
  );
}
