import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const iconContainerSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const svgSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group select-none transition-all duration-300 ${className}`}
      aria-label="CreatorCoach AI Home"
    >
      {/* Precision Emblem Mark */}
      <div
        className={`${iconContainerSizes[size]} relative flex items-center justify-center p-[1px] bg-gradient-to-br from-violet-500/40 via-indigo-500/20 to-cyan-400/40 group-hover:from-violet-500 group-hover:to-cyan-400 transition-all duration-500 shadow-lg shadow-violet-950/40 group-hover:shadow-violet-600/25 group-hover:scale-[1.03]`}
      >
        {/* Deep Dark Core Background */}
        <div className="w-full h-full bg-[#080a11] rounded-[inherit] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Cyber Grid Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/15 via-transparent to-cyan-500/15 pointer-events-none" />

          {/* Precision Vector Emblem */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${svgSizes[size]} relative z-10 transition-transform duration-500 group-hover:rotate-3`}
          >
            <defs>
              <linearGradient id="emblem-grad-primary" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="emblem-grad-accent" x1="10" y1="6" x2="24" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="emblem-grad-core" x1="12" y1="12" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Outer Geometric Shield & 'C' Crest */}
            <path
              d="M17 4H9C7.89543 4 7 4.89543 7 6V26C7 27.1046 7.89543 28 9 28H17C23.0751 28 28 23.0751 28 17C28 10.9249 23.0751 4 17 4Z"
              stroke="url(#emblem-grad-primary)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            />

            {/* Ascending Apex Chevron (Growth & Performance Trajectory) */}
            <path
              d="M13 21L19 15L13 9"
              stroke="url(#emblem-grad-accent)"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Crosshair Tactical Aperture Nodes */}
            <circle cx="19" cy="15" r="1.75" fill="url(#emblem-grad-core)" />
            <circle cx="10" cy="9" r="1" fill="#8b5cf6" className="opacity-80" />
            <circle cx="10" cy="23" r="1" fill="#06b6d4" className="opacity-80" />
          </svg>
        </div>
      </div>

      {/* Wordmark Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-tight">
            <span className={`${textSizes[size]} text-white font-extrabold tracking-tight group-hover:text-white transition-colors`}>
              Creator<span className="text-slate-300 font-semibold">Coach</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/40 text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300 shadow-sm shadow-violet-500/10">
              AI
            </span>
          </div>
          <span className="text-[9px] tracking-[0.24em] uppercase font-mono font-bold text-slate-400 group-hover:text-violet-400/90 transition-colors -mt-0.5 hidden sm:block">
            Gaming Growth Co-Pilot
          </span>
        </div>
      )}
    </Link>
  );
}
