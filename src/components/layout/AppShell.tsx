'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { VideoModal } from '../VideoModal';
import { DataStore } from '@/lib/data/storage';
import { CreatorProfile, Video } from '@/types';
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  PenTool,
  CalendarDays,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  onVideoAdded?: (video: Video) => void;
}

const MOBILE_BOTTOM_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/coach', label: 'AI Coach', icon: Sparkles },
  { href: '/studio', label: 'Studio', icon: PenTool },
  { href: '/planner', label: 'Planner', icon: CalendarDays },
];

export function AppShell({ children, onVideoAdded }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setProfile(DataStore.getProfile());
  }, []);

  const handleResetDemo = () => {
    DataStore.resetToDemoData();
    window.location.reload();
  };

  const handleSaveVideo = (video: Video) => {
    const updated = DataStore.saveVideo(video);
    if (onVideoAdded) {
      onVideoAdded(video);
    } else {
      window.dispatchEvent(new CustomEvent('creatorcoach_video_saved', { detail: updated }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#06070a] text-slate-100 flex flex-col selection:bg-purple-500/30 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onResetDemo={handleResetDemo}
      />

      {/* Topbar */}
      <Topbar
        collapsed={collapsed}
        onToggleMobileMenu={() => setMobileOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        profile={profile}
      />

      {/* Main Page Area */}
      <div
        className={`flex-1 w-full min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24 md:pb-8 animate-in fade-in duration-300 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone & small tablet viewports) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080a10]/95 backdrop-blur-lg border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-2xl pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))]"
      >
        {MOBILE_BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-violet-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-violet-500/15 scale-110' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-4 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Global Quick Add Video Modal */}
      <VideoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveVideo}
      />
    </div>
  );
}
