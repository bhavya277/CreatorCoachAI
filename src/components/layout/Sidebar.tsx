'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../Logo';
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  PenTool,
  CalendarDays,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  X,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onResetDemo?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onResetDemo,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analytics', label: 'Video Analytics', icon: BarChart3 },
    { href: '/coach', label: 'AI Coach', icon: Sparkles, badge: 'Ollama' },
    { href: '/studio', label: 'Content Studio', icon: PenTool },
    { href: '/planner', label: 'Weekly Planner', icon: CalendarDays },
    { href: '/profile', label: 'Creator Profile', icon: User },
    { href: '/profile', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0a0d14] border-r border-white/[0.08] transition-all duration-300 ease-in-out shadow-2xl ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0">
          <Logo size={collapsed ? 'sm' : 'md'} showText={!collapsed} />

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            // Match active if exact or if settings points to /profile
            const isActive =
              item.label === 'Settings'
                ? pathname === '/profile' && idx === 6
                : pathname === item.href && (item.label !== 'Creator Profile' || idx === 5);

            return (
              <Link
                key={`${item.href}-${idx}`}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-600/15 text-white font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-purple-400'
                      : 'text-slate-400 group-hover:text-purple-300'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info & demo reset */}
        <div className="p-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/[0.06] space-y-2 shrink-0">
          {!collapsed ? (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Demo Mode</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              {onResetDemo && (
                <button
                  onClick={onResetDemo}
                  className="w-full flex items-center justify-center gap-1.5 py-2 min-h-[38px] rounded-lg text-[11px] font-semibold text-slate-400 hover:text-purple-300 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Sample Data</span>
                </button>
              )}
            </div>
          ) : (
            onResetDemo && (
              <button
                onClick={onResetDemo}
                title="Reset Sample Data"
                className="w-full p-2.5 rounded-xl text-slate-400 hover:text-purple-300 hover:bg-white/[0.05] flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </aside>
    </>
  );
}
