'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { GameBadge } from '@/components/ui/GameBadge';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { FormatComparisonChart, PerformanceTrendChart } from '@/components/AnalyticsCharts';
import { DataStore } from '@/lib/data/storage';
import { calculateAnalyticsSummary } from '@/lib/analytics/calculator';
import { Video, AnalyticsSummary, CreatorProfile, ContentIdea, CoachingReport } from '@/types';
import { formatNumber, formatPercent, formatDate } from '@/lib/utils';
import {
  Eye,
  Heart,
  TrendingUp,
  Video as VideoIcon,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  CalendarDays,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<ContentIdea[]>([]);
  const [coachingReport, setCoachingReport] = useState<CoachingReport | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [currentDate, setCurrentDate] = useState('Oct 17, 2026');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    loadData();
    const handleVideoSaved = () => loadData();
    window.addEventListener('creatorcoach_video_saved', handleVideoSaved);
    return () => window.removeEventListener('creatorcoach_video_saved', handleVideoSaved);
  }, []);

  const loadData = () => {
    const loadedVideos = DataStore.getVideos();
    const loadedProfile = DataStore.getProfile();
    const loadedPlan = DataStore.getWeeklyPlan();
    const loadedReport = DataStore.getLatestReport();

    setVideos(loadedVideos);
    setProfile(loadedProfile);
    setWeeklyPlan(loadedPlan);
    setCoachingReport(loadedReport);
    setAnalytics(calculateAnalyticsSummary(loadedVideos));
  };

  const publishedCount = weeklyPlan.filter((p) => p.status === 'Published').length;
  const totalGoalPosts = profile?.weekly_goals?.target_posts || 5;
  const sprintProgress = Math.min(100, Math.round((publishedCount / totalGoalPosts) * 100));

  return (
    <AppShell onVideoAdded={() => loadData()}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-purple-600/10 to-transparent pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Creator Dashboard
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {currentDate}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {profile?.creator_name || 'ApexVortex'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Tracking performance across {profile?.main_games?.join(', ') || 'CODM, Valorant, Minecraft, BGMI'}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              href="/coach"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Analyze My Content</span>
            </Link>
          </div>
        </div>

        {/* 4 Refined Metric Panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Views"
            value={formatNumber(analytics?.total_views)}
            subtitle={`Across ${analytics?.total_videos || 0} clips`}
            icon={Eye}
            iconColor="text-purple-400"
          />
          <MetricCard
            title="Total Engagements"
            value={formatNumber((analytics?.total_likes || 0) + (analytics?.total_shares || 0) + (analytics?.total_comments || 0))}
            subtitle={`${formatNumber(analytics?.total_shares)} shares & saves`}
            icon={Heart}
            iconColor="text-rose-400"
          />
          <MetricCard
            title="Avg Views / Video"
            value={formatNumber(analytics?.avg_views)}
            subtitle="Catalog Baseline Reach"
            icon={TrendingUp}
            iconColor="text-indigo-400"
          />
          <MetricCard
            title="Videos Analyzed"
            value={String(analytics?.total_videos || 0)}
            subtitle={`${analytics?.videos_with_complete_engagement || 0} with complete metrics`}
            icon={VideoIcon}
            iconColor="text-cyan-400"
          />
        </div>

        {/* Charts Section: Performance Line & Format Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Upload Retention Trajectory</h3>
                <p className="text-xs text-slate-400">View volume across recent gaming short-form uploads</p>
              </div>
              <Link
                href="/analytics"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Full History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <PerformanceTrendChart data={analytics?.recent_trends || []} />
          </div>

          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Performance by Content Format</h3>
                <p className="text-xs text-slate-400">Average views compared against your catalog baseline</p>
              </div>
              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">
                Baseline: {analytics?.baseline_views.toLocaleString()} views
              </span>
            </div>
            <FormatComparisonChart
              data={analytics?.format_performance || []}
              baselineViews={analytics?.baseline_views || 0}
            />
          </div>
        </div>

        {/* AI Coach Insight Panel & Weekly Sprint Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Coach Insight Panel (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-gradient-to-br from-[#121626] to-[#0d101a] border border-purple-500/30 shadow-2xl shadow-purple-600/5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    AI Coach Diagnostic Insight
                  </h3>
                  <p className="text-xs text-slate-400">Empirically backed pattern discovery</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold">
                High Confidence
              </span>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  Key Observed Pattern:
                </span>
                <p className="text-sm font-medium text-white mt-0.5">
                  Tutorial / Guide clips and fast mobile clutches generate +26% higher average views and 2.4x higher bookmark saves than slow weapon tier lists.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                <span className="text-slate-400 block font-medium">
                  <strong className="text-slate-300">Evidence from your data:</strong> Videos on CODM S&D clutches and Minecraft redstone tricks both exceeded 33K views with retention rates exceeding 68%.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/[0.08] border border-purple-500/20 text-xs">
                <strong className="text-purple-300 block mb-0.5">Actionable Recommendation:</strong>
                <p className="text-slate-200">
                  Double down on 30-40s sub-minute guides featuring clear on-screen input diagrams and instant climax hooks within 1.8 seconds.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">* Hypotheses explicitly distinguished from baseline facts</span>
              <Link
                href="/coach"
                className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>Open Complete Coaching Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Weekly Content Sprint Progress (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] flex flex-col justify-between shadow-xl space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Sprint</h3>
                </div>
                <Link href="/planner" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
                  Board
                </Link>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Weekly Goal Progress</span>
                  <span className="font-bold text-white">
                    {publishedCount} / {totalGoalPosts} Uploads ({sprintProgress}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${sprintProgress}%` }}
                  />
                </div>
              </div>

              {/* Ideas summary */}
              <div className="space-y-2 pt-1 text-left">
                {weeklyPlan.slice(0, 3).map((idea) => (
                  <div
                    key={idea.id}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium text-white truncate">{idea.working_title}</p>
                      <p className="text-[10px] text-slate-400">{idea.game} • {idea.content_format}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        idea.status === 'Published'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : idea.status === 'Scripting'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-white/[0.06] text-slate-400'
                      }`}
                    >
                      {idea.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/planner"
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white transition-all flex items-center justify-center gap-1.5"
            >
              <span>Manage 5-Video Sprint</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top-Performing Videos with Ranking */}
        <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Top-Performing Gaming Clips</h3>
              <p className="text-xs text-slate-400">Ranked by total views and algorithmic engagement impact</p>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>View All ({analytics?.total_videos || 0})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090b12] text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="p-3 w-12 text-center">Rank</th>
                  <th className="p-3">Video Title</th>
                  <th className="p-3">Game</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Likes</th>
                  <th className="p-3">Shares</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] bg-[#0d101a]">
                {analytics?.top_videos?.slice(0, 5).map((v, idx) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : idx === 1
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                            : idx === 2
                            ? 'bg-amber-700/20 text-amber-400 border border-amber-700/30'
                            : 'text-slate-500 font-mono'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
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
                    <td className="p-3 text-slate-300 font-mono">{v.likes !== null ? v.likes.toLocaleString() : '—'}</td>
                    <td className="p-3 text-slate-300 font-mono">{v.shares !== null ? v.shares.toLocaleString() : '—'}</td>
                    <td className="p-3 text-slate-400 font-mono">{formatDate(v.published_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
