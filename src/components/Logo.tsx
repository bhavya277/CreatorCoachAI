import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Custom Gamepad + Analytics Pulse Logo Mark */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-800 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105`}
      >
        <div className="w-full h-full bg-[#0d1017] rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:6px_6px]" />
          
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5/6 h-5/6 relative z-10 text-purple-400 group-hover:text-purple-300 transition-colors"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Gamepad silhouette */}
            <rect x="2" y="6" width="20" height="12" rx="4" className="stroke-indigo-400" />
            {/* D-pad cross */}
            <path d="M6 10h4M8 8v4" className="stroke-purple-300" strokeWidth="2" />
            {/* Action buttons as growth trend dots */}
            <circle cx="15.5" cy="12" r="1.2" fill="#38bdf8" stroke="none" />
            <circle cx="17.5" cy="10" r="1.2" fill="#a855f7" stroke="none" />
            {/* Analytics upward surge line */}
            <path
              d="M7 16l3.5-3.5 2.5 1.5 4.5-4.5"
              stroke="#22c55e"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-tight">
            <span className={`${textSizes[size]} text-white`}>CreatorCoach</span>
            <span className={`${textSizes[size]} bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-extrabold`}>
              AI
            </span>
          </div>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-purple-400/80 -mt-1 hidden sm:block">
            Gaming Growth Engine
          </span>
        </div>
      )}
    </Link>
  );
}
