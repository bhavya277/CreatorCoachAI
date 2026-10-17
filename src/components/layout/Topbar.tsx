'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Plus,
  Search,
  Bell,
  Sparkles,
  Gamepad2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { CreatorProfile } from '@/types';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  onOpenAddModal?: () => void;
  profile?: CreatorProfile | null;
  collapsed: boolean;
}

const PAGE_TITLES: Record<string, { title: string; category: string }> = {
  '/dashboard': { title: 'Dashboard Overview', category: 'Growth Analytics' },
  '/analytics': { title: 'Video Performance & Datasets', category: 'Catalog Intelligence' },
  '/coach': { title: 'AI Growth Coach', category: 'Open-Weight Inference' },
  '/studio': { title: 'Content Studio', category: 'Production & Scripting' },
  '/planner': { title: 'Weekly Sprint Planner', category: 'Execution Pipeline' },
  '/profile': { title: 'Creator Profile & Settings', category: 'Channel Customization' },
};

export function Topbar({
  onToggleMobileMenu,
  onOpenAddModal,
  profile,
  collapsed,
}: TopbarProps) {
  const pathname = usePathname();
  const pageInfo = PAGE_TITLES[pathname] || { title: 'Creator Dashboard', category: 'CreatorCoach AI' };

  return (
    <header
      className={`sticky top-0 z-30 h-16 border-b border-white/[0.08] bg-[#07080d]/85 backdrop-blur-md transition-all duration-300 flex items-center justify-between px-4 sm:px-6 lg:px-8 ${
        collapsed ? 'lg:pl-24' : 'lg:pl-72'
      }`}
    >
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span>{pageInfo.category}</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-purple-400 font-semibold">{pageInfo.title.split(' ')[0]}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none mt-0.5">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Demo Mode Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Demo Mode</span>
        </div>

        {/* New Video Button */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Video</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}

        {/* Notifications / Activity Indicator */}
        <button
          title="Notifications & Updates"
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
        </button>

        {/* Creator Mini Profile Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08] hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-purple-500/20">
            <div className="w-full h-full bg-[#0d0f17] rounded-full flex items-center justify-center text-xs font-bold text-purple-300">
              {profile?.creator_name ? profile.creator_name[0] : 'A'}
            </div>
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              {profile?.creator_name || 'ApexVortex'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono leading-none">
              {profile?.handle || '@apexvortex'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
