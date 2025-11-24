'use client';

import React, { useContext } from 'react';
import { X, Zap } from 'lucide-react';
import { StoreContext } from './utils/store';
import { formatCurrency, cn } from './utils/formatters';

/**
 * TokenDetailModal — corrected version
 * - working image handling
 * - fixed import paths
 * - fallback image included
 * - no lint errors
 */

export default function TokenDetailModal() {
  const { state, dispatch } = useContext(StoreContext);
  const token = state.selectedToken;

  if (!token) return null;

  const fallbackImage = "/mnt/data/ab650e4d-4c95-4120-b749-fe7ce3b9d49d.png";
  const heroImage = token.image ?? fallbackImage;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-6"
      onClick={() => dispatch({ type: 'SELECT_TOKEN', payload: null })}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-70 w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800">
              <img
                src={heroImage}
                alt={token.symbol}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="text-lg font-bold text-white">{token.name}</div>
              <div className="text-xs text-zinc-400">
                {token.symbol} • {token.id?.toString().substring(0, 8)}...
              </div>
            </div>
          </div>

          <button
            onClick={() => dispatch({ type: 'SELECT_TOKEN', payload: null })}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {/* HERO IMAGE */}
            <div className="w-full rounded-lg overflow-hidden mb-4">
              <img
                src={heroImage}
                alt={`${token.symbol}-hero`}
                className="w-full h-[260px] object-cover rounded-lg border border-zinc-800"
              />
            </div>

            <div className="text-sm text-zinc-300 space-y-3">
              <p>
                Full token details go here. Add charts, recent transactions, LP data, etc.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {/* PRICE */}
                <div className="p-3 bg-zinc-950/40 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400 uppercase">Price</div>
                  <div className="text-xl font-mono text-zinc-100">
                    {formatCurrency(token.price)}
                  </div>
                </div>

                {/* CHANGE */}
                <div className="p-3 bg-zinc-950/40 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400 uppercase">24h</div>
                  <div
                    className={cn(
                      "text-xl font-mono",
                      token.change24h >= 0 ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {token.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ASIDE DETAILS */}
          <aside className="p-4 bg-zinc-950/40 rounded border border-zinc-800 space-y-3">
            <div>
              <div className="text-xs text-zinc-400 uppercase">Liquidity</div>
              <div className="text-sm font-mono text-zinc-200">
                {formatCurrency(token.liquidity)}
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-400 uppercase mt-2">Market Cap</div>
              <div className="text-sm font-mono text-zinc-200">
                {formatCurrency(token.mcap)}
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-400 uppercase mt-2">Holders</div>
              <div className="text-sm font-mono text-zinc-200">{token.holders}</div>
            </div>

            <button className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white flex items-center justify-center gap-2">
              <Zap size={16} /> Quick Buy
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
