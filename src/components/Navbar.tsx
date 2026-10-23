'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  PenTool,
  CalendarDays,
  Settings,
  Plus,
  Menu,
  X,
  RotateCcw,
  Gamepad2,
  Check,
} from 'lucide-react';
import { DataStore } from '@/lib/data/storage';

interface NavbarProps {
  onOpenAddModal?: () => void;
}

export function Navbar({ onOpenAddModal }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetNotice, setShowResetNotice] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/coach', label: 'AI Coach', icon: Sparkles, badge: 'Open-AI' },
    { href: '/studio', label: 'Content Studio', icon: PenTool },
    { href: '/planner', label: 'Weekly Planner', icon: CalendarDays },
    { href: '/profile', label: 'Settings', icon: Settings },
  ];

  const handleResetDemo = () => {
    DataStore.resetToDemoData();
    setShowResetNotice(true);
    setTimeout(() => {
      setShowResetNotice(false);
      window.location.reload();
    }, 800);
  };

  const isLanding = pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090b10]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Logo size="md" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-white/[0.08] shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-3">
          {/* Demo status & Reset button */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              title="Reset data to default gaming dataset"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-300 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] px-2.5 py-1.5 rounded-md transition-all"
            >
              {showResetNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Resetting...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Demo Mode</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </>
              )}
            </button>
          </div>

          {/* New Video Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-2.5 sm:px-3.5 py-1.5 rounded-lg shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Add Video</span>
              <span className="xs:hidden">Add</span>
            </button>
          )}

          {isLanding && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-4 py-1.5 rounded-xl shadow-md shadow-violet-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0c0f17] px-4 pt-3 pb-5 space-y-2 animate-in fade-in duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-purple-600/20 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-200 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white shadow-md shadow-violet-600/25 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Get Started</span>
              </Link>
            </div>

            <button
              onClick={handleResetDemo}
              className="w-full text-xs text-slate-400 hover:text-purple-300 flex items-center justify-center gap-1.5 py-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Gaming Data</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
