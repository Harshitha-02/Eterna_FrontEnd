'use client';
import React, { useContext, useMemo } from 'react';
import TokenCard, { Token } from '../molecules/TokenCard';
import { Skeleton } from '../atoms/Skeleton';
import { Filter } from 'lucide-react';
import { StoreContext } from '../utils/store';

type Props = { title: string; category: 'new' | 'stretch' | 'migrated'; colorClass?: string };

export default function TokenListColumn({ title, category, colorClass = '' }: Props) {
  const { state } = useContext(StoreContext);

  const displayTokens = useMemo(() => {
    let list = state.tokens[category] ?? [];
    if (state.filter) {
      const q = state.filter.toLowerCase();
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (state.sortKey === 'created') return b.created - a.created;
      if (state.sortKey === 'volume') return (b.volume || 0) - (a.volume || 0);
      if (state.sortKey === 'change24h') return Math.abs(b.change24h) - Math.abs(a.change24h);
      return 0;
    });
  }, [state.tokens, state.filter, state.sortKey, category]);

  return (
    <div className="flex-1 min-w-[300px] h-full flex flex-col bg-[#09090b] border-r border-zinc-800 last:border-r-0">
      <div className="sticky top-0 z-10 bg-[#09090b]/95 backdrop-blur-sm border-b border-zinc-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded bg-opacity-10 ${colorClass}`} />
          <h2 className="text-sm font-semibold text-zinc-200 tracking-wide">{title}</h2>
          <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono">
            {displayTokens.length}
          </span>
        </div>
        <button className="text-zinc-500 hover:text-zinc-300">
          <Filter size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {state.isLoading ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-zinc-900/30 rounded border border-zinc-800/50 flex flex-col p-3 gap-2">
                <div className="flex gap-2 mb-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="w-12 h-3" />
                    <Skeleton className="w-20 h-2" />
                  </div>
                </div>
                <Skeleton className="w-full h-1.5 rounded-full" />
                <div className="flex justify-between mt-1">
                  <Skeleton className="w-16 h-3" />
                  <Skeleton className="w-16 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          displayTokens.map((token: Token) => (
            <TokenCard key={token.id} token={token} />
          ))
        )}

        {!state.isLoading && displayTokens.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Filter size={24} className="mb-2 opacity-20" />
            <p className="text-xs">No tokens found</p>
          </div>
        )}
      </div>
    </div>
  );
}
