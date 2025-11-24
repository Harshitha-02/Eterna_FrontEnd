'use client';

import React from 'react';
import StoreProvider from '../providers/StoreProvider';
import Header from '../components/Header';
import TokenListColumn from '../components/organisms/TokenListColumn';
import TokenDetailModal from '../components/TokenDetailModal';

export default function Page() {
  return (
    <StoreProvider>
      <div className="flex flex-col h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
        <Header />

        {/* MAIN GRID */}
        <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          <TokenListColumn
            title="New Pairs"
            category="new"
            colorClass="bg-blue-500 text-blue-400"
          />

          <TokenListColumn
            title="Final Stretch"
            category="stretch"
            colorClass="bg-orange-500 text-orange-400"
          />

          <TokenListColumn
            title="Migrated"
            category="migrated"
            colorClass="bg-green-500 text-green-400"
          />
        </main>

        {/* FOOTER STATUS BAR */}
        <footer className="h-8 bg-[#050505] border-t border-zinc-800 flex items-center justify-between px-4 text-[10px] text-zinc-600 uppercase font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-green-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Operational
            </span>
            <span>TPS: 4,291</span>
            <span>Gas: 0.0002 SOL</span>
          </div>
          <div>Wait time: &lt;100ms</div>
        </footer>

        {/* MODAL */}
        <TokenDetailModal />

        {/* CUSTOM SCROLLBAR */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #09090b; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        `}</style>
      </div>
    </StoreProvider>
  );
}
