import React from 'react';
import { Platform } from '@/types';

interface PlatformBadgeProps {
  platform: Platform | string;
  size?: 'sm' | 'md';
  className?: string;
}

export function PlatformBadge({ platform, size = 'sm', className = '' }: PlatformBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const isYouTube = platform === 'youtube_shorts' || platform.toLowerCase().includes('youtube');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border tracking-tight ${sizeClasses} ${
        isYouTube
          ? 'bg-red-500/10 text-red-300 border-red-500/20'
          : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isYouTube ? 'bg-red-400' : 'bg-purple-400'
        }`}
      />
      <span>{isYouTube ? 'Shorts' : 'Reels'}</span>
    </span>
  );
}
