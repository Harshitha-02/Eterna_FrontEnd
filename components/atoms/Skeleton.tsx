// components/atoms/Skeleton.tsx
'use client';
import React from 'react';

export const Skeleton = ({ className = '' }: { className?: string }) => {
  return <div className={`animate-pulse bg-zinc-800/50 rounded ${className}`} />;
};
