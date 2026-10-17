'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { VideoModal } from '@/components/VideoModal';
import { CsvImportModal } from '@/components/CsvImportModal';
import { GameBadge } from '@/components/ui/GameBadge';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { FormatComparisonChart, PlatformComparisonBars } from '@/components/AnalyticsCharts';
import { DataStore } from '@/lib/data/storage';
import { calculateAnalyticsSummary, calculateEngagementRate } from '@/lib/analytics/calculator';
import { Video, Game, Platform, ContentFormat, AnalyticsSummary } from '@/types';
import { formatNumber, formatPercent, formatDate } from '@/lib/utils';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit,
  ArrowUpDown,
  Info,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Download,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [sortField, setSortField] = useState<'views' | 'published_at' | 'engagement'>('published_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    setVideos(DataStore.getVideos());
  };

  const handleSaveVideo = (savedVideo: Video) => {
    const updated = DataStore.saveVideo(savedVideo);
    setVideos(updated);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Delete this video record from your catalog?')) {
      const updated = DataStore.deleteVideo(id);
      setVideos(updated);
    }
  };

  const handleImportSuccess = (importedVideos: Video[]) => {
    const updated = DataStore.importVideos(importedVideos);
    setVideos(updated);
  };

  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        const matchesSearch =
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGame = selectedGame === 'All' || v.game === selectedGame;
        const matchesPlatform = selectedPlatform === 'All' || v.platform === selectedPlatform;
        const matchesFormat = selectedFormat === 'All' || v.content_format === selectedFormat;
        return matchesSearch && matchesGame && matchesPlatform && matchesFormat;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'views') {
          comp = a.views - b.views;
        } else if (sortField === 'published_at') {
          comp = new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
        } else if (sortField === 'engagement') {
          const rateA = calculateEngagementRate(a) ?? -1;
          const rateB = calculateEngagementRate(b) ?? -1;
          comp = rateA - rateB;
        }
        return sortDirection === 'desc' ? -comp : comp;
      });
  }, [videos, searchQuery, selectedGame, selectedPlatform, selectedFormat, sortField, sortDirection]);

  const activeSummary: AnalyticsSummary = useMemo(() => {
    return calculateAnalyticsSummary(filteredVideos.length > 0 ? filteredVideos : videos);
  }, [filteredVideos, videos]);

  const toggleSort = (field: 'views' | 'published_at' | 'engagement') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <AppShell onVideoAdded={() => loadVideos()}>
      <div className="space-y-8 text-left">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Catalog Intelligence
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {videos.length} videos recorded
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Video Analytics & Datasets
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Strict deterministic calculations with explicit denominators and missing metric tolerance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-slate-200 hover:text-white transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingVideo(null);
                setIsVideoModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Video</span>
            </button>
          </div>
        </div>

        {/* Formula & Data Quality Bar */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-300">Documented Denominator Formula:</span>{' '}
              <code className="text-purple-300 font-mono px-2 py-0.5 rounded bg-white/[0.04]">
                ((likes + comments + shares) / views) × 100
              </code>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeSummary.videos_with_complete_engagement} complete metrics</span>
            </span>
            {activeSummary.videos_with_missing_metrics > 0 && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{activeSummary.videos_with_missing_metrics} omitted (null preserved)</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Charts Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Content Format Reach</h3>
                <p className="text-xs text-slate-400">Average views by format vs catalog baseline</p>
              </div>
              <span className="text-xs text-purple-400 font-mono bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                Baseline: {activeSummary.baseline_views.toLocaleString()}
              </span>
            </div>
            <FormatComparisonChart
              data={activeSummary.format_performance}
              baselineViews={activeSummary.baseline_views}
            />
          </div>

          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Platform Distribution</h3>
                <p className="text-xs text-slate-400">YouTube Shorts vs Instagram Reels reach</p>
              </div>
            </div>
            <PlatformComparisonBars data={activeSummary.platform_performance} />
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, hook keywords, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filter Game: CODM included */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141826] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Games</option>
                <option value="Minecraft">Minecraft</option>
                <option value="Valorant">Valorant</option>
                <option value="CODM">CODM (Call of Duty: Mobile)</option>
                <option value="BGMI">BGMI</option>
                <option value="Apex Legends">Apex Legends</option>
                <option value="GTA V">GTA V</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Filter Platform */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141826] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Platforms</option>
                <option value="youtube_shorts">YouTube Shorts</option>
                <option value="instagram_reels">Instagram Reels</option>
              </select>
            </div>

            {/* Filter Format */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141826] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Formats</option>
                <option value="Tutorial / Guide">Tutorial / Guide</option>
                <option value="Clutch / Highlight">Clutch / Highlight</option>
                <option value="Fail / Funny">Fail / Funny</option>
                <option value="Challenge / Experiment">Challenge / Experiment</option>
                <option value="News / Lore">News / Lore</option>
                <option value="Review / Tier List">Review / Tier List</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Table */}
        <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {filteredVideos.length} of {videos.length} videos
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sort by:</span>
              <button
                onClick={() => toggleSort('published_at')}
                className={`px-2.5 py-1 rounded ${sortField === 'published_at' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'hover:text-white'}`}
              >
                Date {sortField === 'published_at' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
              </button>
              <button
                onClick={() => toggleSort('views')}
                className={`px-2.5 py-1 rounded ${sortField === 'views' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'hover:text-white'}`}
              >
                Views {sortField === 'views' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
              </button>
              <button
                onClick={() => toggleSort('engagement')}
                className={`px-2.5 py-1 rounded ${sortField === 'engagement' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'hover:text-white'}`}
              >
                Engagement {sortField === 'engagement' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090b12] text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Game</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Format</th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort('views')}>
                    <div className="flex items-center gap-1">
                      <span>Views</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="p-3">Likes</th>
                  <th className="p-3">Comments</th>
                  <th className="p-3">Shares</th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort('engagement')}>
                    <div className="flex items-center gap-1">
                      <span>Eng. Rate</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort('published_at')}>
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] bg-[#0d101a]">
                {filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-500 text-xs">
                      No videos matched your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((v) => {
                    const engRate = calculateEngagementRate(v);
                    return (
                      <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-semibold text-white max-w-xs truncate" title={v.title}>
                          {v.title}
                        </td>
                        <td className="p-3">
                          <GameBadge game={v.game} />
                        </td>
                        <td className="p-3">
                          <PlatformBadge platform={v.platform} />
                        </td>
                        <td className="p-3 text-slate-300">{v.content_format}</td>
                        <td className="p-3 font-bold text-purple-400 font-mono">{v.views.toLocaleString()}</td>
                        <td className="p-3 text-slate-300 font-mono">
                          {v.likes !== null ? v.likes.toLocaleString() : <span className="text-slate-500 italic">null</span>}
                        </td>
                        <td className="p-3 text-slate-300 font-mono">
                          {v.comments !== null ? v.comments.toLocaleString() : <span className="text-slate-500 italic">null</span>}
                        </td>
                        <td className="p-3 text-slate-300 font-mono">
                          {v.shares !== null ? v.shares.toLocaleString() : <span className="text-slate-500 italic">null</span>}
                        </td>
                        <td className="p-3 font-semibold font-mono">
                          {engRate !== null ? (
                            <span className="text-emerald-400">{formatPercent(engRate)}</span>
                          ) : (
                            <span className="text-slate-500 italic" title="Missing required metric for formula">
                              Omitted
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{formatDate(v.published_at)}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingVideo(v);
                                setIsVideoModalOpen(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-purple-300 hover:bg-white/[0.05]"
                              title="Edit Video"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(v.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/[0.05]"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSave={handleSaveVideo}
        initialVideo={editingVideo}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </AppShell>
  );
}
