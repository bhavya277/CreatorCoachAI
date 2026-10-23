'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { GameBadge } from '@/components/ui/GameBadge';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { PerformanceTrendChart, FormatComparisonChart } from '@/components/AnalyticsCharts';
import { CsvImportModal } from '@/components/CsvImportModal';
import { VideoModal } from '@/components/VideoModal';
import { DataService, DataStore } from '@/lib/data/storage';
import { calculateAnalyticsSummary } from '@/lib/analytics/calculator';
import { Video, CreatorProfile, ContentIdea, CoachingReport, AnalyticsSummary } from '@/types';
import { formatNumber, formatPercent } from '@/lib/utils';
import {
  Eye,
  Heart,
  TrendingUp,
  Video as VideoIcon,
  Sparkles,
  ChevronRight,
  Flame,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Share2,
  Plus,
  Upload,
  RotateCcw,
  Film,
} from 'lucide-react';

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<ContentIdea[]>([]);
  const [coachingReport, setCoachingReport] = useState<CoachingReport | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [currentDate, setCurrentDate] = useState('Oct 18, 2026');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    loadData();
    const handleVideoSaved = () => loadData();
    window.addEventListener('creatorcoach_video_saved', handleVideoSaved);
    return () => window.removeEventListener('creatorcoach_video_saved', handleVideoSaved);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadedVideos, loadedProfile, loadedPlan] = await Promise.all([
        DataService.getVideos(),
        DataService.getProfile(),
        DataService.getWeeklyPlan(),
      ]);

      const loadedReport = DataStore.getLatestReport();

      setVideos(loadedVideos);
      setProfile(loadedProfile);
      setWeeklyPlan(loadedPlan);
      setCoachingReport(loadedReport);
      setAnalytics(calculateAnalyticsSummary(loadedVideos));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemoData = async () => {
    if (confirm('Load 18 authentic sample gaming clips (CODM, Valorant, Minecraft, BGMI) into your dashboard?')) {
      await DataService.loadSampleDataIntoAccount();
      await loadData();
    }
  };

  const publishedCount = weeklyPlan.filter((p) => p.status === 'Published').length;
  const totalGoalPosts = profile?.weekly_goals?.target_posts || 5;
  const sprintProgress = Math.min(100, Math.round((publishedCount / totalGoalPosts) * 100));

  const hasVideos = videos.length > 0;
  const sortedVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <AppShell onVideoAdded={() => loadData()}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl glass-panel shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-violet-600/10 via-cyan-500/5 to-transparent pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-violet-400">
                Creator Dashboard
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
                {currentDate}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
              Welcome back, {profile?.creator_name || 'Creator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {hasVideos
                ? `Tracking ${videos.length} videos across ${profile?.main_games?.join(', ') || 'CODM, Valorant'}`
                : 'Your creator workspace is ready. Ingest video data to unlock growth diagnostics.'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 relative z-10 w-full md:w-auto">
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-violet-400" />
              <span>Add Clip</span>
            </button>
            <Link
              href="/coach"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Analyze Content</span>
            </Link>
          </div>
        </div>

        {/* Empty Catalog Callout if 0 videos */}
        {!hasVideos && !loading && (
          <div className="p-5 sm:p-8 rounded-2xl glass-panel border border-violet-500/30 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-violet-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-300 mx-auto flex items-center justify-center">
              <Film className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white">No Videos in Your Catalog Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add clips manually or import a CSV export from YouTube Studio / Instagram Insights to calculate real engagement rates and get tailored AI coaching.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg cursor-pointer hover:from-violet-500 hover:to-indigo-500 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Video</span>
              </button>
              <button
                onClick={() => setIsCsvModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-slate-200 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Import CSV File</span>
              </button>
              <button
                onClick={handleSeedDemoData}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Explore with Sample Data</span>
              </button>
            </div>
          </div>
        )}

        {/* 4 Refined Metric Panels - 2 columns on phone, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <MetricCard
            title="Total Views"
            value={formatNumber(analytics?.total_views || 0)}
            subtitle={`Across ${analytics?.total_videos || 0} clips`}
            icon={Eye}
            iconColor="text-violet-400"
          />
          <MetricCard
            title="Total Engagements"
            value={formatNumber((analytics?.total_likes || 0) + (analytics?.total_shares || 0) + (analytics?.total_comments || 0))}
            subtitle={`${formatNumber(analytics?.total_shares || 0)} shares & saves`}
            icon={Heart}
            iconColor="text-rose-400"
          />
          <MetricCard
            title="Avg Views / Video"
            value={formatNumber(analytics?.avg_views || 0)}
            subtitle="Catalog Baseline Reach"
            icon={TrendingUp}
            iconColor="text-indigo-400"
          />
          <MetricCard
            title="Videos Analyzed"
            value={String(analytics?.total_videos || 0)}
            subtitle={`${analytics?.videos_with_complete_engagement || 0} complete metrics`}
            icon={VideoIcon}
            iconColor="text-cyan-400"
          />
        </div>

        {/* Charts Section: Performance Line & Format Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Upload Retention Trajectory</h3>
                <p className="text-xs text-slate-400">View volume across short-form uploads</p>
              </div>
              <Link
                href="/analytics"
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                <span>Full History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {hasVideos ? (
              <PerformanceTrendChart data={analytics?.recent_trends || []} />
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-white/[0.08] rounded-xl text-center p-6">
                <TrendingUp className="w-8 h-8 mb-2 opacity-30 text-violet-400" />
                <span>Upload clips to view trajectory chart</span>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Performance by Content Format</h3>
                <p className="text-xs text-slate-400">Average views compared against your catalog baseline</p>
              </div>
              <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/25">
                Baseline: {(analytics?.baseline_views || 0).toLocaleString()} views
              </span>
            </div>
            {hasVideos && (analytics?.format_performance || []).length > 0 ? (
              <FormatComparisonChart
                data={analytics?.format_performance || []}
                baselineViews={analytics?.baseline_views || 0}
              />
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-white/[0.08] rounded-xl text-center p-6">
                <VideoIcon className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                <span>Add videos with formats to view format comparison</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Coach Insight Panel & Weekly Sprint Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Coach Insight Panel (8 cols) */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-gradient-to-br from-[#121626] to-[#0d101a] border border-violet-500/30 shadow-2xl shadow-violet-600/5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300">
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
                {coachingReport?.recommendations?.[0]?.confidence ? `${coachingReport.recommendations[0].confidence} Confidence` : 'Active Model'}
              </span>
            </div>

            {coachingReport ? (
              <div className="space-y-3 text-left">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                    Key Observed Pattern:
                  </span>
                  <p className="text-sm font-medium text-white mt-0.5">
                    {coachingReport.summary}
                  </p>
                </div>

                {coachingReport.recommendations && coachingReport.recommendations.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-violet-500/[0.08] border border-violet-500/20 text-xs">
                    <strong className="text-violet-300 block mb-0.5">Actionable Recommendation:</strong>
                    <p className="text-slate-200">
                      {coachingReport.recommendations[0].action}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
                <Sparkles className="w-6 h-6 text-violet-400 mx-auto opacity-60" />
                <h4 className="text-sm font-bold text-white">Ready for Content Diagnosis</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {hasVideos
                    ? 'Your video catalog is ready for AI coaching. Generate a comprehensive report to discover format fatigue and high-retention patterns.'
                    : 'Add your clips to let the open-weight AI coach detect retention anomalies.'}
                </p>
                <div className="pt-2">
                  <Link
                    href="/coach"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                  >
                    <span>Run AI Coach Diagnosis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
              <span className="text-xs text-slate-500">* Hypotheses explicitly distinguished from baseline facts</span>
              <Link
                href="/coach"
                className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                <span>Open Complete Coaching Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Weekly Content Sprint Progress (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-2xl glass-panel flex flex-col justify-between shadow-xl space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Sprint</h3>
                </div>
                <Link href="/planner" className="text-xs font-semibold text-violet-400 hover:text-violet-300">
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
                    className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${sprintProgress}%` }}
                  />
                </div>
              </div>

              {/* Ideas summary */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Sprint Concepts ({weeklyPlan.length})
                </span>
                {weeklyPlan.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/[0.08] text-center text-xs text-slate-500">
                    No active concepts. Open Planner to add your next 5 video hypotheses.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {weeklyPlan.slice(0, 3).map((idea) => (
                      <div
                        key={idea.id}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-white truncate">{idea.working_title}</p>
                          <span className="text-[10px] text-slate-400">{idea.game}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-medium shrink-0">
                          {idea.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/planner"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition-colors"
            >
              <span>Manage Sprint Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top Performing Videos Table */}
        <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Top Performing Gaming Clips</h3>
                <p className="text-xs text-slate-400">Ranked by authentic view volume and audience engagement</p>
              </div>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0"
            >
              <span>View All {videos.length} Videos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!hasVideos ? (
            <div className="h-32 flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-white/[0.08] rounded-xl text-center">
              <span>No videos uploaded yet to rank.</span>
            </div>
          ) : (
            <>
              {/* Mobile View: Vertical Cards (Phones < 640px) */}
              <div className="sm:hidden space-y-2.5">
                {sortedVideos.map((video, idx) => {
                  const engRate =
                    video.views > 0 && video.likes !== null && video.comments !== null && video.shares !== null
                      ? ((video.likes + video.comments + video.shares) / video.views) * 100
                      : null;

                  return (
                    <div
                      key={video.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                              idx === 0
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-white/[0.06] text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-xs text-white truncate">
                            {video.title}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-white shrink-0">
                          {formatNumber(video.views)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04] text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <GameBadge game={video.game} size="sm" />
                          <PlatformBadge platform={video.platform} size="sm" />
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[10px] text-slate-400">{video.content_format.split('/')[0]}</span>
                          <span className="font-bold text-violet-400">
                            {engRate !== null ? formatPercent(engRate) : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tablet & Desktop View: Structured Table (>= 640px) */}
              <div className="hidden sm:block overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                <table className="w-full text-left text-xs sm:text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-2">Rank</th>
                      <th className="pb-3">Title & Game</th>
                      <th className="pb-3">Platform</th>
                      <th className="pb-3">Format</th>
                      <th className="pb-3 text-right">Views</th>
                      <th className="pb-3 text-right pr-2">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {sortedVideos.map((video, idx) => {
                      const engRate =
                        video.views > 0 && video.likes !== null && video.comments !== null && video.shares !== null
                          ? ((video.likes + video.comments + video.shares) / video.views) * 100
                          : null;

                      return (
                        <tr key={video.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-3 pl-2 font-mono font-bold text-slate-500">
                            {idx === 0 ? (
                              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center justify-center text-[10px]">
                                1
                              </span>
                            ) : (
                              `#${idx + 1}`
                            )}
                          </td>
                          <td className="py-3">
                            <div className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                              {video.title}
                            </div>
                            <div className="mt-0.5">
                              <GameBadge game={video.game} />
                            </div>
                          </td>
                          <td className="py-3">
                            <PlatformBadge platform={video.platform} />
                          </td>
                          <td className="py-3">
                            <span className="text-xs text-slate-400">{video.content_format}</span>
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-white">
                            {formatNumber(video.views)}
                          </td>
                          <td className="py-3 text-right pr-2 font-mono font-bold text-violet-400">
                            {engRate !== null ? formatPercent(engRate) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <CsvImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          onImportSuccess={(newVideos) => {
            DataService.importVideos(newVideos);
            loadData();
            setIsCsvModalOpen(false);
          }}
        />
      )}

      {/* Video Entry Modal */}
      {isVideoModalOpen && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          onSave={(newVideo) => {
            DataService.saveVideo(newVideo);
            loadData();
            setIsVideoModalOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}
