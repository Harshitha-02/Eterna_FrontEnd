'use client';

import React, { useEffect, useRef, useState, useContext } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { StoreContext } from '../utils/store';
import { formatCurrency, formatCompact, cn } from '../utils/formatters';
import { Tooltip } from '../atoms/Tooltip';

export type Token = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  prevPrice?: number;
  change24h: number;
  volume?: number;
  mcap: number;
  status: 'new' | 'stretch' | 'migrated';
  progress: number;
  liquidity: number;
  created: number;
  holders: number;
  image?: string | null;
};

export default function TokenCard({ token }: { token: Token }) {
  const { dispatch } = useContext(StoreContext);
  const priceRef = useRef(token.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  // PRICE FLASH ANIMATION
  useEffect(() => {
    if (token.price > priceRef.current) setFlash('up');
    else if (token.price < priceRef.current) setFlash('down');

    priceRef.current = token.price;
    const t = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(t);
  }, [token.price]);

  const isUp = token.change24h >= 0;
  const isMigrated = token.status === 'migrated';

  return (
    <div
      onClick={() => dispatch({ type: 'SELECT_TOKEN', payload: token })}
      className={cn(
        "group relative p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border-b border-zinc-800/50 last:border-0 cursor-pointer transition-colors duration-150"
      )}
    >
      {/* TOP SECTION */}
      <div className="flex justify-between items-start mb-2">

        {/* LEFT SIDE: AVATAR + TEXT */}
        <div className="flex items-center gap-2">

          {/* AVATAR (THIS IS THE FIX) */}
          <div className="relative group/avatar">
            <div
              className={cn(
                "w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-zinc-700 transition-transform duration-300 ease-out origin-center",
                "group-hover/avatar:scale-[2.0] group-hover/avatar:z-50 group-hover/avatar:shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              )}
            >
              {token.symbol.substring(0, 2)}
            </div>

            {isMigrated && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-zinc-900">
                <CheckCircle2 size={8} className="text-black" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* NAME + SYMBOL */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-200 text-sm tracking-tight">
                {token.symbol}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">/SOL</span>
            </div>
            <div className="text-[10px] text-zinc-500 truncate max-w-[80px]">
              {token.name}
            </div>
          </div>
        </div>

        {/* PRICE BLOCK */}
        <div className="text-right">
          <div
            className={cn(
              "text-sm font-mono font-medium transition-colors duration-300 tabular-nums",
              flash === "up"
                ? "text-green-400"
                : flash === "down"
                ? "text-red-400"
                : "text-zinc-200"
            )}
          >
            {formatCurrency(token.price)}
          </div>

          <div
            className={cn(
              "text-[10px] font-mono flex items-center justify-end gap-0.5",
              isUp ? "text-green-500" : "text-red-500"
            )}
          >
            {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(token.change24h).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* PROGRESS BAR / MIGRATED */}
      {!isMigrated ? (
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2 mt-1">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              token.status === "stretch" ? "bg-orange-500" : "bg-blue-500"
            )}
            style={{ width: `${token.progress}%` }}
          />
        </div>
      ) : (
        <div className="mb-2 mt-1 flex items-center gap-1">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-green-500/50 to-transparent" />
          <span className="text-[9px] uppercase font-bold text-green-500 tracking-wider">
            Migrated
          </span>
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex gap-2">
          {!isMigrated && (
            <span
              className={cn(
                "text-[10px] font-medium",
                token.status === "stretch" ? "text-orange-400" : "text-zinc-500"
              )}
            >
              {token.progress}% bonded
            </span>
          )}

          {isMigrated && (
            <span className="px-1.5 py-0.5 text-[9px] rounded bg-green-950/30 text-green-400 border border-green-900/50">
              Raydium
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono">
            MC: {formatCompact(token.mcap)}
          </span>
          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
            <Activity size={10} />
            {Math.floor((Date.now() - token.created) / 60000)}m
          </span>
        </div>
      </div>

      {/* HOVER ACTION BUTTONS */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex gap-1 z-10">
        <Tooltip
          trigger={
            <button className="p-1.5 bg-zinc-950 border border-zinc-700 text-zinc-400 hover:text-white rounded hover:border-zinc-500 transition-colors">
              <Activity size={14} />
            </button>
          }
          content="Chart"
        />
        <Tooltip
          trigger={
            <button className="p-1.5 bg-zinc-950 border border-zinc-700 text-zinc-400 hover:text-white rounded hover:border-zinc-500 transition-colors">
              <Zap size={14} />
            </button>
          }
          content="Quick Buy"
        />
      </div>
    </div>
  );
}
