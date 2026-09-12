'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/lib/offline-manager';

export default function LoginPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [hasPreviousLogin, setHasPreviousLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logged = localStorage.getItem('postcp_logged_in') === 'true';
      setHasPreviousLogin(logged);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // LocalStorageにもセッションフラグを保存（PWAオフライン時等）
        localStorage.setItem('postcp_logged_in', 'true');
        router.push('/');
        router.refresh();
      } else {
        setError(data.message || 'ログイン情報が正しくありません');
      }
    } catch (err) {
      setError('通信エラーが発生しました。電波状況をご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-100 to-slate-200 px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm mx-auto my-auto">
        {/* アプリロゴ・ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-postal-red text-white shadow-lg shadow-red-500/20 mb-4 border-2 border-white">
            <span className="text-4xl font-black tracking-wider">〒</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            ポスト収集 QRコード
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            収集チェックポイント WebApp
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 p-6 border border-slate-100">
          <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              認証ログイン
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 共通アカウント
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ユーザー名 (ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名を入力"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-sm text-slate-800 placeholder-slate-400 outline-none transition bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-sm text-slate-800 placeholder-slate-400 outline-none transition bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-postal-red hover:bg-postal-darkRed active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-red-500/30 transition duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ログイン</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* オフライン時のバイパスボタン */}
            {(!isOnline || hasPreviousLogin) && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>端末保存データでアプリを開く</span>
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          ※ 収集担当者専用システムです
        </p>
      </div>

      <footer className="text-center text-[11px] text-slate-400">
        PostCP System v1.0
      </footer>
    </main>
  );
}
