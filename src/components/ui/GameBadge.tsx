import React from 'react';
import { Game } from '@/types';

interface GameBadgeProps {
  game: Game | string;
  size?: 'sm' | 'md';
  className?: string;
}

export function GameBadge({ game, size = 'sm', className = '' }: GameBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  let style = 'bg-white/[0.05] text-slate-300 border-white/[0.08]';

  switch (game) {
    case 'Minecraft':
      style = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-emerald-500/5';
      break;
    case 'Valorant':
      style = 'bg-rose-500/10 text-rose-300 border-rose-500/25 shadow-rose-500/5';
      break;
    case 'CODM':
      style = 'bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-amber-500/5';
      break;
    case 'BGMI':
      style = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25 shadow-cyan-500/5';
      break;
    case 'Apex Legends':
      style = 'bg-orange-500/10 text-orange-300 border-orange-500/25';
      break;
    case 'GTA V':
      style = 'bg-violet-500/10 text-violet-300 border-violet-500/25';
      break;
    default:
      style = 'bg-white/[0.05] text-slate-300 border-white/[0.1]';
  }

  const displayName = game === 'CODM' ? 'CODM' : game;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border tracking-tight ${sizeClasses} ${style} ${className}`}
    >
      {displayName}
    </span>
  );
}
