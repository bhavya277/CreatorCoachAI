'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { VideoModal } from '../VideoModal';
import { DataStore } from '@/lib/data/storage';
import { CreatorProfile, Video } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  onVideoAdded?: (video: Video) => void;
}

export function AppShell({ children, onVideoAdded }: AppShellProps) {
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
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col selection:bg-purple-500/30">
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
        className={`flex-1 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Global Quick Add Video Modal */}
      <VideoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveVideo}
      />
    </div>
  );
}
