// components/atoms/Badge.tsx
'use client';
import React, { ReactNode } from 'react';

type Variant = 'neutral' | 'success' | 'danger' | 'accent' | 'warning';
type Props = { variant?: Variant; className?: string; children?: ReactNode };

export const Badge = ({ variant = 'neutral', className = '', children }: Props) => {
  const styles: Record<Variant, string> = {
    neutral: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    success: 'bg-green-950/30 text-green-400 border-green-900/50',
    danger: 'bg-red-950/30 text-red-400 border-red-900/50',
    accent: 'bg-blue-950/30 text-blue-400 border-blue-900/50',
    warning: 'bg-orange-950/30 text-orange-400 border-orange-900/50',
  };
  return <span className={`px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider border rounded ${styles[variant]} ${className}`}>{children}</span>;
};
