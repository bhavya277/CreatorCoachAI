'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  Plus,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Sparkles,
  ShieldCheck,
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
  profile: propProfile,
  collapsed,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile: authProfile, signOut, isConfigured } = useAuth();
  const profile = propProfile || authProfile;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageInfo = PAGE_TITLES[pathname] || { title: 'Creator Dashboard', category: 'CreatorCoach AI' };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push('/login');
    router.refresh();
  };

  const displayName =
    (user
      ? (profile?.creator_name && profile.creator_name !== 'ApexVortex Gaming' ? profile.creator_name : null) ||
        user?.user_metadata?.creator_name ||
        user?.email?.split('@')[0]
      : profile?.creator_name) || 'Creator';

  const handleName =
    (user
      ? (profile?.handle && profile.handle !== '@apexvortex' ? profile.handle : null) ||
        (user?.user_metadata?.creator_name ? `@${user.user_metadata.creator_name.toLowerCase().replace(/\s+/g, '')}` : null) ||
        (user?.email ? `@${user.email.split('@')[0]}` : null)
      : profile?.handle) || '@creator';
  const initial = displayName ? displayName[0].toUpperCase() : 'C';

  return (
    <header
      className={`sticky top-0 z-30 h-16 border-b border-white/[0.08] bg-[#07080d]/85 backdrop-blur-md transition-all duration-300 flex items-center justify-between px-3 sm:px-6 lg:px-8 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}
    >
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 pr-2">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer shrink-0"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
            <span className="hidden xs:inline truncate">{pageInfo.category}</span>
            <ChevronRight className="w-3 h-3 text-slate-600 hidden xs:inline shrink-0" />
            <span className="text-violet-400 font-semibold truncate">{pageInfo.title.split(' ')[0]}</span>
          </div>
          <h1 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight leading-tight truncate">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Auth status indicator */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white/[0.03] border-white/[0.08]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              user ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300">
            {user ? 'Cloud Sync' : isConfigured ? 'Guest' : 'Demo Mode'}
          </span>
        </div>

        {/* New Video Button */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-md shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Video</span>
            <span className="sm:hidden text-xs">Add</span>
          </button>
        )}

        {/* Creator Profile Avatar & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-2 border-l border-white/[0.08] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
              <div className="w-full h-full bg-[#0d0f17] rounded-full flex items-center justify-center text-xs font-bold text-violet-300">
                {initial}
              </div>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono leading-none">
                {handleName}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#0e111a] border border-white/[0.1] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-white/[0.08]">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate font-mono">
                  {user?.email || handleName}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-violet-400" />
                  <span>Channel Profile</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>AI & Database Settings</span>
                </Link>
              </div>

              <div className="border-t border-white/[0.08] pt-1">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In to Cloud</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

