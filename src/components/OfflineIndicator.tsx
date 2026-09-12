'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '@/lib/offline-manager';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
      setShowRestored(false);
    } else if (hasBeenOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  // オンラインかつ復帰メッセージもない場合は何も表示しない
  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div className="w-full transition-all duration-300 animate-slide-down">
      {!isOnline ? (
        // オフライン警告バナー
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-xl mx-auto w-full">
            <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
            <div className="flex-1 min-w-0">
              <span className="font-black">オフラインモード動作中</span>
              <span className="hidden sm:inline font-normal text-amber-100 ml-2">
                （端末に保存されたキャッシュで検索・QR表示が可能です）
              </span>
            </div>
            <span className="text-[10px] bg-amber-700/80 px-2 py-0.5 rounded-full font-medium">
              キャッシュ稼働
            </span>
          </div>
        </div>
      ) : (
        // オンライン復帰バナー
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2 max-w-xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-200" />
            <span>オンラインに復帰しました（通信が再開されました）</span>
          </div>
        </div>
      )}
    </div>
  );
}
