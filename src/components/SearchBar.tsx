'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchBar({
  query,
  onQueryChange,
  resultCount,
  totalCount,
}: SearchBarProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="ポスト名や番号で検索 (例: 宮本, 20, 薬局)"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-postal-red shadow-sm transition"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 active:scale-95"
          >
            <X className="w-4 h-4 bg-slate-100 rounded-full p-0.5" />
          </button>
        )}
      </div>

      {query && (
        <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5 px-1 font-medium">
          <span>「{query}」の検索結果</span>
          <span>{resultCount} / {totalCount} 件</span>
        </div>
      )}
    </div>
  );
}
