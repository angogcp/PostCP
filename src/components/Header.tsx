'use client';

import { LogOut, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WardId, WARDS } from '@/types/post';

interface HeaderProps {
  selectedWard: WardId;
  onSelectWard: (ward: WardId) => void;
  counts: Record<WardId, number>;
  onOpenCreateModal: () => void;
}

export default function Header({
  selectedWard,
  onSelectWard,
  counts,
  onOpenCreateModal,
}: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm('ログアウトしますか？')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('postcp_logged_in');
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm safe-top">
      <div className="max-w-xl mx-auto px-4 pt-3 pb-2.5">
        {/* 最上部：ロゴ・タイトル・新規追加・ログアウト */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-postal-red text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-red-500/30">
              〒
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                ポスト収集 QR
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">チェックポイント検索</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 新規登録ボタン */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-postal-red hover:bg-postal-darkRed active:scale-95 text-white font-bold text-xs shadow-sm shadow-red-500/20 transition"
              title="新しいポストを登録"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>登録</span>
            </button>

            {/* ログアウト */}
            <button
              onClick={handleLogout}
              title="ログアウト"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 active:bg-slate-100 p-1.5 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 区切り替えタブ（1区 / 2区 / 3区） */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {WARDS.map((w) => {
            const count = counts[w.id] || 0;
            const isSelected = selectedWard === w.id;
            return (
              <button
                key={w.id}
                onClick={() => onSelectWard(w.id)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-postal-red shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/60'
                }`}
              >
                <span>{w.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-red-50 text-postal-red'
                      : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {count > 0 ? `${count}件` : '0件'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
