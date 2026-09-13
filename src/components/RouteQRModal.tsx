'use client';

import { useState } from 'react';
import { X, QrCode } from 'lucide-react';
import { WARD_ROUTES } from '@/data/routes';

interface RouteQRModalProps {
  isOpen: boolean;
  ward: number;
  initialShiftId?: string;
  onClose: () => void;
}

export default function RouteQRModal({
  isOpen,
  ward,
  initialShiftId = 'bin2',
  onClose,
}: RouteQRModalProps) {
  const routesData = WARD_ROUTES[ward];
  const shifts = routesData?.weekday || [];
  const [selectedShiftId, setSelectedShiftId] = useState<string>(initialShiftId);

  if (!isOpen || shifts.length === 0) return null;

  const currentShift =
    shifts.find((s) => s.id === selectedShiftId) || shifts[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-postal-red flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                運行便 開始QRコード（第{ward}区）
              </h3>
              <p className="text-[11px] text-slate-500">
                収集開始時・便切り替え時にスキャン
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

        {/* 便切り替えタブ */}
        <div className="p-3 bg-slate-100/70 border-b border-slate-200/60">
          <div className="grid grid-cols-3 gap-1.5">
            {shifts.map((shift) => {
              const isSelected = shift.id === currentShift.id;
              return (
                <button
                  key={shift.id}
                  onClick={() => setSelectedShiftId(shift.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-white text-postal-red shadow-sm border border-red-200'
                      : 'bg-transparent text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <span className="text-xs font-black">{shift.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {shift.timeRange.split('〜')[0].trim()}〜
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* メインQR表示領域 */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center">
          {/* 便名バッジ & 時間 */}
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${currentShift.badgeColor}`}
              >
                {currentShift.name}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {currentShift.timeRange}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {currentShift.description}
            </span>
          </div>

          {/* QRコード画像 */}
          <div className="w-full bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentShift.qrImage}
              alt={`${currentShift.name} 開始QR`}
              className="w-full h-auto max-h-[360px] object-contain rounded-xl select-none"
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500 font-medium">
              端末リーダーで「便名」→「区名」の順に読み取ってください
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">平日ダイヤ運行中</span>
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
