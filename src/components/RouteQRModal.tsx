'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Settings,
  Check,
  RotateCcw,
} from 'lucide-react';
import { RouteShift, WARD_ROUTES } from '@/data/routes';

import Encoding from 'encoding-japanese';

interface RouteQRModalProps {
  isOpen: boolean;
  ward: number;
  initialShiftId?: string;
  initialDayType?: 'weekday' | 'holiday';
  onClose: () => void;
}

export default function RouteQRModal({
  isOpen,
  ward,
  initialShiftId = 'bin2',
  initialDayType = 'weekday',
  onClose,
}: RouteQRModalProps) {
  const routesData = WARD_ROUTES[ward];
  const [dayType, setDayType] = useState<'weekday' | 'holiday'>(initialDayType);
  const isHoliday = dayType === 'holiday';

  const shifts = isHoliday
    ? routesData?.holiday || []
    : routesData?.weekday || [];

  const [selectedShiftId, setSelectedShiftId] = useState<string>(initialShiftId);
  const [viewMode, setViewMode] = useState<'digital' | 'photo'>('digital');
  const [zoomTarget, setZoomTarget] = useState<'bin' | 'ward' | null>(null);

  // 初期値の同期
  useEffect(() => {
    if (isOpen) {
      setDayType(initialDayType);
      if (initialDayType === 'holiday' && initialShiftId === 'special') {
        setSelectedShiftId('bin2');
      } else {
        setSelectedShiftId(initialShiftId);
      }
    }
  }, [isOpen, initialDayType, initialShiftId]);

  // 土日祝に特便が選ばれていたら2号便に戻す
  useEffect(() => {
    if (isHoliday && selectedShiftId === 'special') {
      setSelectedShiftId('bin2');
    }
  }, [isHoliday, selectedShiftId]);

  // カスタムQR文字列（LocalStorageで保存・編集可能）
  const [customQrStrings, setCustomQrStrings] = useState<Record<string, { bin: string; ward: string }>>({});
  const [isEditingData, setIsEditingData] = useState(false);
  const [editBinStr, setEditBinStr] = useState('');
  const [editWardStr, setEditWardStr] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  // SVG strings
  const [binSvg, setBinSvg] = useState<string>('');
  const [wardSvg, setWardSvg] = useState<string>('');

  const currentShift =
    shifts.find((s) => s.id === selectedShiftId) || shifts[0];

  // LocalStorageからカスタムQR設定を読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('postcp_route_qrs');
        localStorage.removeItem('postcp_route_qrs_v2');
        const saved = localStorage.getItem('postcp_route_qrs_v4');
        if (saved) {
          setCustomQrStrings(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load custom route qrs', e);
      }
    }
  }, []);

  const qrStorageKey = `${dayType}_${currentShift?.id}`;

  // 現在の便・区のQR文字列
  const currentBinData =
    customQrStrings[qrStorageKey]?.bin || currentShift?.binQrData || (isHoliday ? 'BIN:01;D01:03;S01:01;B01:02;N01:休日取集２号便;' : 'BIN:01;D01:01;S01:01;B01:02;N01:平日取集２号便;');
  const currentWardData =
    customQrStrings[qrStorageKey]?.ward || currentShift?.wardQrData || 'DIV:01;C01:003;N01:3区;';

  // 編集フィールドの同期
  useEffect(() => {
    setEditBinStr(currentBinData);
    setEditWardStr(currentWardData);
    setZoomTarget(null);
  }, [selectedShiftId, dayType, currentBinData, currentWardData]);

  // QRコードSVGの生成（日本の郵便端末標準であるShift-JISバイナリでエンコード）
  useEffect(() => {
    if (!currentShift) return;

    // Shift-JISバイナリ変換ヘルパー
    const toSjisSegments = (text: string) => {
      try {
        const sjisArray = Encoding.convert(Encoding.stringToCode(text), {
          to: 'SJIS',
          from: 'UNICODE',
        });
        return [{ data: new Uint8Array(sjisArray), mode: 'byte' as const }];
      } catch (e) {
        return text;
      }
    };

    // 便名QR
    QRCode.toString(
      toSjisSegments(currentBinData) as any,
      {
        type: 'svg',
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      },
      (err, str) => {
        if (!err && str) setBinSvg(str);
      }
    );

    // 区名QR
    QRCode.toString(
      toSjisSegments(currentWardData) as any,
      {
        type: 'svg',
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      },
      (err, str) => {
        if (!err && str) setWardSvg(str);
      }
    );
  }, [currentShift, currentBinData, currentWardData]);

  if (!isOpen || !currentShift) return null;

  // QR文字列の保存
  const handleSaveQrData = () => {
    const next = {
      ...customQrStrings,
      [qrStorageKey]: {
        bin: editBinStr.trim() || currentShift.binQrData,
        ward: editWardStr.trim() || currentShift.wardQrData,
      },
    };
    setCustomQrStrings(next);
    localStorage.setItem('postcp_route_qrs_v4', JSON.stringify(next));
    setIsEditingData(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // デフォルトに戻す
  const handleResetQrData = () => {
    const next = { ...customQrStrings };
    delete next[qrStorageKey];
    setCustomQrStrings(next);
    localStorage.setItem('postcp_route_qrs_v4', JSON.stringify(next));
    setEditBinStr(currentShift.binQrData);
    setEditWardStr(currentShift.wardQrData);
    setIsEditingData(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* トースト */}
        {saveToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
            <Check className="w-4 h-4" />
            <span>QRコード設定を保存しました</span>
          </div>
        )}

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-postal-red flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
                運行便 開始QRコード（第{ward}区）
              </h3>
              <p className="text-[11px] text-slate-500">
                ①便名 → ②区名の順に端末リーダーでスキャン
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

        {/* ダイヤ種別切り替えタブ（平日 / 土日祝） */}
        <div className="px-4 pt-2.5 pb-1 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200/80 w-full sm:w-auto">
            <button
              onClick={() => setDayType('weekday')}
              className={`flex-1 sm:flex-initial px-3.5 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                !isHoliday
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>平日ダイヤ (2号・3号・特便)</span>
            </button>
            <button
              onClick={() => {
                setDayType('holiday');
                if (selectedShiftId === 'special') setSelectedShiftId('bin2');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isHoliday
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>土日祝ダイヤ (2号・3号のみ)</span>
            </button>
          </div>
        </div>

        {/* 便切り替えタブ */}
        <div className="p-2.5 bg-slate-100/80 border-b border-slate-200/60">
          <div className={`grid ${isHoliday ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5`}>
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

        {/* 表示モード切り替えタブ（デジタル再生成 vs 原本写真） */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs ${currentShift.badgeColor}`}
            >
              {currentShift.name}
            </span>
            <span className="text-xs font-bold text-slate-700">
              {currentShift.timeRange}
            </span>
          </div>

          <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg text-xs font-bold border border-slate-200">
            <button
              onClick={() => setViewMode('digital')}
              className={`py-1 px-2.5 rounded-md flex items-center gap-1 transition ${
                viewMode === 'digital'
                  ? 'bg-postal-red text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>デジタルQR</span>
            </button>
            <button
              onClick={() => setViewMode('photo')}
              className={`py-1 px-2.5 rounded-md flex items-center gap-1 transition ${
                viewMode === 'photo'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>原本写真</span>
            </button>
          </div>
        </div>

        {/* メインQR表示領域 */}
        <div className="p-3 sm:p-5 flex-1 overflow-y-auto flex flex-col items-center justify-center">
          {viewMode === 'digital' ? (
            /* 高精細デジタルQR（左：便名、中央：矢印、右：区名） */
            <div className="w-full space-y-3">
              {zoomTarget ? (
                /* 個別超大型ズーム表示 */
                <div className="w-full bg-slate-50 rounded-2xl p-4 border-2 border-postal-red flex flex-col items-center animate-scaleIn">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-700 px-2 py-0.5 rounded bg-red-50 text-postal-red">
                      {zoomTarget === 'bin' ? `① ${currentShift.name}` : `② 第${ward}区`} (全画面拡大中)
                    </span>
                    <button
                      onClick={() => setZoomTarget(null)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                      <span>並び表示に戻す</span>
                    </button>
                  </div>
                  <div
                    className="w-64 h-64 sm:w-80 sm:h-80 bg-white p-3 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center"
                    dangerouslySetInnerHTML={{
                      __html: zoomTarget === 'bin' ? binSvg : wardSvg,
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-2 font-bold font-mono">
                    スキャン内容: {zoomTarget === 'bin' ? currentBinData : currentWardData}
                  </p>
                </div>
              ) : (
                /* 通常の横並びカード表示 */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative">
                  {/* 便名QRカード */}
                  <div
                    onClick={() => setZoomTarget('bin')}
                    className="group bg-slate-50 hover:bg-red-50/50 p-3 sm:p-4 rounded-2xl border-2 border-slate-200 hover:border-red-300 shadow-xs cursor-pointer transition flex flex-col items-center text-center relative"
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        ステップ ①
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold group-hover:text-postal-red flex items-center gap-0.5">
                        <ZoomIn className="w-3 h-3" /> タップで拡大
                      </span>
                    </div>

                    <div className="text-base font-black text-slate-800 mb-2">
                      {currentShift.name}
                    </div>

                    <div
                      className="w-40 h-40 sm:w-44 sm:h-44 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform"
                      dangerouslySetInnerHTML={{ __html: binSvg }}
                    />

                    <div className="mt-2 text-[10px] text-slate-500 font-mono font-medium break-all max-w-full leading-tight">
                      コード: <span className="font-bold text-slate-800 select-all">{currentBinData}</span>
                    </div>
                  </div>

                  {/* 矢印（デスクトップでは中央、スマホでは間） */}
                  <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-postal-red pointer-events-none">
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* 区名QRカード */}
                  <div
                    onClick={() => setZoomTarget('ward')}
                    className="group bg-slate-50 hover:bg-red-50/50 p-3 sm:p-4 rounded-2xl border-2 border-slate-200 hover:border-red-300 shadow-xs cursor-pointer transition flex flex-col items-center text-center relative"
                  >
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ステップ ②
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold group-hover:text-postal-red flex items-center gap-0.5">
                        <ZoomIn className="w-3 h-3" /> タップで拡大
                      </span>
                    </div>

                    <div className="text-base font-black text-slate-800 mb-2">
                      第{ward}区
                    </div>

                    <div
                      className="w-40 h-40 sm:w-44 sm:h-44 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform"
                      dangerouslySetInnerHTML={{ __html: wardSvg }}
                    />

                    <div className="mt-2 text-[10px] text-slate-500 font-mono font-medium break-all max-w-full leading-tight">
                      コード: <span className="font-bold text-slate-800 select-all">{currentWardData}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* QRコード設定・調整アコーディオン */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                {!isEditingData ? (
                  <button
                    onClick={() => setIsEditingData(true)}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium py-1 flex items-center justify-center gap-1.5 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>QRコードのスキャン文字列を変更・微調整する</span>
                  </button>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 animate-fadeIn text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        QRスキャンデータ設定
                      </span>
                      <button
                        onClick={handleResetQrData}
                        className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>初期値に戻す</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          {currentShift.name} QR文字列
                        </label>
                        <input
                          type="text"
                          value={editBinStr}
                          onChange={(e) => setEditBinStr(e.target.value)}
                          className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-postal-red"
                          placeholder={currentShift.binQrData}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          {ward}区 QR文字列
                        </label>
                        <input
                          type="text"
                          value={editWardStr}
                          onChange={(e) => setEditWardStr(e.target.value)}
                          className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-postal-red"
                          placeholder={currentShift.wardQrData}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsEditingData(false)}
                        className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-200"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSaveQrData}
                        className="px-4 py-1 rounded-lg text-xs font-bold bg-postal-red text-white hover:bg-postal-darkRed shadow-xs"
                      >
                        保存して再生成
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 原本写真表示モード */
            <div className="w-full flex flex-col items-center">
              <div className="w-full bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentShift.qrImage}
                  alt={`${currentShift.name} 原本写真`}
                  className="w-full h-auto max-h-[300px] object-contain rounded-xl select-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                原本の写真画像です（読み取りにくい場合は「デジタルQR」をご利用ください）
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {viewMode === 'digital' ? '✨ 高精細デジタルQR表示中' : '📷 原本写真表示中'}
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
