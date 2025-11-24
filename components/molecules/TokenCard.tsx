// components/molecules/TokenCard.tsx
'use client';

import React, { useEffect, useRef, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
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

/**
 * ImageHoverPreview Portal
 */
function ImageHoverPreview({
  src,
  visible,
  rect,
}: {
  src: string;
  visible: boolean;
  rect: DOMRect | null;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elRef.current) {
      const d = document.createElement('div');
      elRef.current = d;
      document.body.appendChild(d);
    }
    return () => {
      if (elRef.current) {
        document.body.removeChild(elRef.current);
        elRef.current = null;
      }
    };
  }, []);

  if (!elRef.current || !visible || !rect) return null;

  const PREVIEW_W = 320;
  const PREVIEW_H = 220;
  const margin = 12;

  let left = rect.left + rect.width / 2 - PREVIEW_W / 2;
  let top = rect.top - PREVIEW_H - margin;

  if (top < 8) top = rect.bottom + margin;

  const vw = window.innerWidth;
  if (left + PREVIEW_W > vw - 8) left = vw - PREVIEW_W - 8;
  if (left < 8) left = 8;

  const vh = window.innerHeight;
  if (top + PREVIEW_H > vh - 8) top = vh - PREVIEW_H - 8;
  if (top < 8) top = 8;

  const style: React.CSSProperties = {
    position: 'fixed',
    left,
    top,
    width: PREVIEW_W,
    height: PREVIEW_H,
    zIndex: 9999,
    pointerEvents: 'none',
  };

  return createPortal(
    <div
      style={style}
      className="rounded-lg overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900/90 backdrop-blur-sm"
    >
      <img src={src} alt="preview" className="w-full h-full object-cover" draggable={false} />
    </div>,
    elRef.current
  );
}

export default function TokenCard({ token }: { token: Token }) {
  const { dispatch } = useContext(StoreContext);
  const priceRef = useRef(token.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  // Avatar hover preview logic
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [avatarRect, setAvatarRect] = useState<DOMRect | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  // PRICE FLASH
  useEffect(() => {
    if (token.price > priceRef.current) setFlash('up');
    else if (token.price < priceRef.current) setFlash('down');

    priceRef.current = token.price;
    const t = window.setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(t);
  }, [token.price]);

  const isUp = token.change24h >= 0;
  const isMigrated = token.status === 'migrated';

  // ⭐ ALWAYS SHOW REAL IMAGE
  const imageSrc =
    token.image || `https://picsum.photos/200/200?random=${token.id}`;

  // hover listeners
  const handleAvatarEnter = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    const rect = avatarRef.current?.getBoundingClientRect() ?? null;
    setAvatarRect(rect);

    hoverTimerRef.current = window.setTimeout(() => {
      setPreviewVisible(true);
      hoverTimerRef.current = null;
    }, 120);
  };

  const handleAvatarMove = () => {
    const rect = avatarRef.current?.getBoundingClientRect() ?? null;
    setAvatarRect(rect);
  };

  const handleAvatarLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setPreviewVisible(false);
  };

  return (
    <>
      <div
        onClick={() => dispatch({ type: 'SELECT_TOKEN', payload: token })}
        className="group relative p-3 bg-zinc-900/40 hover:bg-zinc-800/60 border-b border-zinc-800/50 cursor-pointer"
      >
        {/* TOP */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {/* AVATAR */}
            <div
              ref={avatarRef}
              onMouseEnter={handleAvatarEnter}
              onMouseMove={handleAvatarMove}
              onMouseLeave={handleAvatarLeave}
              className="relative"
            >
              <img
                src={imageSrc}
                alt={token.symbol}
                className="w-8 h-8 rounded-full object-cover border border-zinc-700"
              />

              {isMigrated && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-zinc-900">
                  <CheckCircle2 size={8} className="text-black" strokeWidth={3} />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-200 text-sm">{token.symbol}</span>
                <span className="text-[10px] text-zinc-500 font-mono">/SOL</span>
              </div>
              <div className="text-[10px] text-zinc-500 truncate max-w-[80px]">{token.name}</div>
            </div>
          </div>

          {/* PRICE */}
          <div className="text-right">
            <div
              className={cn(
                'text-sm font-mono transition-colors',
                flash === 'up'
                  ? 'text-green-400'
                  : flash === 'down'
                  ? 'text-red-400'
                  : 'text-zinc-200'
              )}
            >
              {formatCurrency(token.price)}
            </div>

            <div
              className={cn(
                'text-[10px] font-mono flex items-center gap-0.5',
                isUp ? 'text-green-500' : 'text-red-500'
              )}
            >
              {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {Math.abs(token.change24h).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* PROGRESS */}
        {!isMigrated ? (
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                token.status === 'stretch' ? 'bg-orange-500' : 'bg-blue-500'
              )}
              style={{ width: `${token.progress}%` }}
            />
          </div>
        ) : (
          <div className="mb-2 flex items-center gap-1">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-green-500/50 to-transparent" />
            <span className="text-[9px] uppercase font-bold text-green-500">
              Migrated
            </span>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-between mt-1">
          <div className="text-[10px] text-zinc-500">
            MC: {formatCompact(token.mcap)}
          </div>
          <div className="text-[10px] text-zinc-600 font-mono">
            {Math.floor((Date.now() - token.created) / 60000)}m
          </div>
        </div>
      </div>

      {/* FLOATING PREVIEW */}
      <ImageHoverPreview src={imageSrc} visible={previewVisible} rect={avatarRect} />
    </>
  );
}
