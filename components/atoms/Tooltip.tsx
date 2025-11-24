// components/atoms/Tooltip.tsx
'use client';
import React, { ReactNode, useState } from 'react';

export const Tooltip = ({ trigger, content }: { trigger: ReactNode; content: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative group" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {trigger}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded whitespace-nowrap z-50 shadow-xl">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
        </div>
      )}
    </div>
  );
};
