// components/atoms/AvatarPreview.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/formatters';

/**
 * AvatarPreview
 * - props.imageSrc: use the attached image path or token-specific image
 * - on hover: show large modal-like overlay (fixed, centered) with smooth scale & shadow
 * - small avatar is still interactive and scales a bit on hover
 *
 * NOTE: For the assessment I used the provided image at
 * /mnt/data/ab650e4d-4c95-4120-b749-fe7ce3b9d49d.png as the default preview image.
 */

type Props = {
  imageSrc?: string | null;
  initials?: string;
  size?: number; // px (for the small avatar)
  alt?: string;
};

export default function AvatarPreview({ imageSrc = '/mnt/data/ab650e4d-4c95-4120-b749-fe7ce3b9d49d.png', initials = 'TK', size = 40, alt = 'avatar' }: Props) {
  const [hovering, setHovering] = useState(false);
  const enterRef = useRef<number | null>(null);
  const leaveRef = useRef<number | null>(null);

  // small delay to avoid flicker when quickly moving cursor
  const handleMouseEnter = () => {
    if (leaveRef.current) {
      window.clearTimeout(leaveRef.current);
      leaveRef.current = null;
    }
    enterRef.current = window.setTimeout(() => setHovering(true), 120);
  };

  const handleMouseLeave = () => {
    if (enterRef.current) {
      window.clearTimeout(enterRef.current);
      enterRef.current = null;
    }
    leaveRef.current = window.setTimeout(() => setHovering(false), 120);
  };

  useEffect(() => {
    return () => {
      if (enterRef.current) window.clearTimeout(enterRef.current);
      if (leaveRef.current) window.clearTimeout(leaveRef.current);
    };
  }, []);

  return (
    <>
      <div
        className={cn(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden select-none',
          'transition-transform duration-200 ease-out',
          'group',
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover rounded-full border border-zinc-700"
            style={{ display: 'block' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-zinc-700 text-white font-bold"
            style={{ fontSize: Math.floor(size / 2.6) }}
          >
            {initials}
          </div>
        )}

        {/* subtle hover scale on the small avatar */}
        <style>{`
          .group:hover img, .group:hover div { transform: scale(1.15); box-shadow: 0 6px 18px rgba(0,0,0,0.45); transition: transform 160ms ease-out, box-shadow 160ms ease-out; }
        `}</style>
      </div>

      {/* Full-screen modal-like preview (fixed) */}
      {hovering && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
        >
          {/* backdrop (slightly transparent + blur) */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div
            className="relative z-50 max-w-[720px] w-[min(92%,720px)] p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-900/70 border border-zinc-800 transform transition-all duration-220 ease-out"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={alt}
                    className="w-48 h-48 rounded-2xl object-cover border border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-zinc-700 flex items-center justify-center text-3xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold text-zinc-100">Preview</h3>
                <p className="text-sm text-zinc-400 mt-1">Large preview — hover to keep open. Click the token card to open full details.</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs bg-zinc-800/60 border border-zinc-700 px-2 py-1 rounded text-zinc-300">Image</span>
                  <span className="text-xs bg-indigo-800/30 border border-indigo-700 px-2 py-1 rounded text-indigo-300">On Hover</span>
                  <span className="text-xs bg-green-800/30 border border-green-700 px-2 py-1 rounded text-green-300">Modal-like</span>
                </div>
              </div>

              <button
                onClick={() => setHovering(false)}
                aria-label="Close preview"
                className="ml-4 text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-900/30 border border-zinc-800"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
