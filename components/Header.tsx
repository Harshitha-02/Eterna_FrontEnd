// components/Header.tsx
'use client';
import React, { useContext } from 'react';
import { Search, Activity, Clock, Flame } from 'lucide-react';
import { StoreContext } from './utils/store';

export default function Header() {
  const { state, dispatch } = useContext(StoreContext);

  return (
    <header className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between bg-[#09090b]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-indigo-500">
          <Activity className="animate-pulse" size={24} />
          <span className="text-lg font-bold tracking-tight text-white">
            AXIOM<span className="text-indigo-500">.TRADE</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {['Discover', 'Pulse', 'Portfolio'].map((item) => (
            <button
              key={item}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${item === 'Pulse' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input
            type="text"
            placeholder="Search tokens..."
            className="h-9 w-64 bg-zinc-900 border border-zinc-800 rounded-md pl-9 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-700"
            onChange={(e) => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-1">
          <button onClick={() => dispatch({ type: 'SET_SORT', payload: 'created' })} className={`p-1.5 rounded ${state.sortKey === 'created' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>
            <Clock size={14} />
          </button>
          <button onClick={() => dispatch({ type: 'SET_SORT', payload: 'change24h' })} className={`p-1.5 rounded ${state.sortKey === 'change24h' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>
            <Activity size={14} />
          </button>
          <button onClick={() => dispatch({ type: 'SET_SORT', payload: 'volume' })} className={`p-1.5 rounded ${state.sortKey === 'volume' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>
            <Flame size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
