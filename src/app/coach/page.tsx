'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { GameBadge } from '@/components/ui/GameBadge';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { DataService, DataStore } from '@/lib/data/storage';
import { CoachingReport, Video, CreatorProfile, ContentIdea } from '@/types';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  FlaskConical,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Info,
  CalendarDays,
  Plus,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

export default function CoachPage() {
  const [report, setReport] = useState<CoachingReport | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccessNotice, setSavedSuccessNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedVideos, loadedProfile] = await Promise.all([
      DataService.getVideos(),
      DataService.getProfile(),
    ]);
    setVideos(loadedVideos);
    setProfile(loadedProfile);
    setReport(DataStore.getLatestReport());
  };

  const handleGenerateReport = async (useDemo: boolean = false) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videos,
          profile,
          endpoint: profile?.ai_model_config?.endpoint,
          model: profile?.ai_model_config?.model,
          useDemoReport: useDemo,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error ||
            'Ollama service could not be reached. Ensure ollama serve is active or use the verified demo report.'
        );
      } else {
        setReport(data.report);
        DataStore.saveCoachingReport(data.report);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setErrorMessage(`Network error: ${msg}. Make sure your local server is operational.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushExperimentToPlanner = async (exp: {
    title: string;
    game: string;
    format: string;
    platform: 'instagram_reels' | 'youtube_shorts';
    hypothesis: string;
  }) => {
    const idea: ContentIdea = {
      id: `plan-exp-${Date.now()}`,
      game: exp.game as ContentIdea['game'],
      content_format: exp.format as ContentIdea['content_format'],
      working_title: exp.title,
      hook: `Hook testing hypothesis: ${exp.hypothesis}`,
      content_outline: `Experimental setup targeting: ${exp.hypothesis}`,
      platform: exp.platform,
      objective: 'Validate coach experiment target metric',
      hypothesis_to_test: exp.hypothesis,
      status: 'Idea',
      created_at: new Date().toISOString(),
    };

    await DataService.saveContentIdea(idea);
    setSavedSuccessNotice(`Added "${exp.title}" directly to your Weekly Content Planner!`);
    setTimeout(() => setSavedSuccessNotice(null), 3000);
  };

  const handleCopyRecommendation = (rec: { id: number; title: string; action: string; evidence: string }) => {
    navigator.clipboard.writeText(`Recommendation: ${rec.title}\nAction: ${rec.action}\nEvidence: ${rec.evidence}`);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppShell onVideoAdded={() => loadData()}>
      <div className="space-y-8 text-left">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Open-Weight AI Growth Engine
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Model: {profile?.ai_model_config?.model || 'llama3.2:latest'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              AI Gaming Growth Coach
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Rigorous diagnostic reasoning distinguishing observed data from causal hypotheses. No viral snake oil.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => handleGenerateReport(false)}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Synthesizing Ollama Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Run Live Ollama Analysis</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleGenerateReport(true)}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-slate-200 hover:text-white transition-all text-center"
            >
              Load Verified Demo Report
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccessNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccessNotice}</span>
            </div>
            <Link href="/planner" className="font-bold underline hover:text-emerald-300">
              View in Planner
            </Link>
          </div>
        )}

        {/* Offline / Error Alert */}
        {errorMessage && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Open-Weight AI Inference Unavailable</span>
            </div>
            <p className="leading-relaxed">{errorMessage}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleGenerateReport(true)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-semibold text-rose-200 text-xs"
              >
                Switch to Demo Report (Zero-Setup)
              </button>
              <Link
                href="/profile"
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs"
              >
                Configure Ollama Endpoint
              </Link>
              <Link
                href="/analytics"
                className="text-slate-400 hover:text-slate-200 underline text-xs"
              >
                Continue using deterministic analytics
              </Link>
            </div>
          </div>
        )}

        {/* Scientific Coaching Principle */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Scientific Coaching Principle:</strong> Correlation does not prove causation. Gaming short-form distribution depends on early retention curves, sound trending velocity, and community engagement. All interpretations are clearly presented as hypotheses for controlled testing.
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-[#0d101a] border border-white/[0.08] space-y-4 animate-pulse">
            <div className="h-4 w-48 bg-white/[0.06] rounded" />
            <div className="h-6 w-3/4 bg-white/[0.08] rounded" />
            <div className="h-4 w-5/6 bg-white/[0.04] rounded" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="h-32 bg-white/[0.03] rounded-xl" />
              <div className="h-32 bg-white/[0.03] rounded-xl" />
            </div>
          </div>
        )}

        {/* Main Coaching Report Content */}
        {!isLoading && report && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Observed Performance Summary
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Model: {report.model_used || 'Open-Weight Model'}
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                {report.summary}
              </p>
            </div>

            {/* Top Formats vs Underperforming (Hypotheses) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Formats */}
              <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white">Top-Performing Content Formats</h3>
                </div>

                <div className="space-y-3">
                  {report.top_performing_formats?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-1.5"
                    >
                      <h4 className="font-bold text-emerald-300 text-sm">{item.format}</h4>
                      <p className="text-xs text-slate-300">{item.observation}</p>
                      <p className="text-[11px] text-slate-400 border-l-2 border-emerald-500/40 pl-2">
                        <strong className="text-emerald-400">Metric Evidence:</strong> {item.metric_evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Underperforming Formats with Hypotheses */}
              <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white">Underperforming Content (Hypotheses)</h3>
                </div>

                <div className="space-y-3">
                  {report.underperforming_content?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 space-y-1.5"
                    >
                      <h4 className="font-bold text-amber-300 text-sm">{item.format}</h4>
                      <p className="text-xs text-slate-300">{item.observation}</p>
                      <p className="text-[11px] text-amber-300/90 font-medium bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                        {item.potential_hypothesis}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Three Actionable Recommendations */}
            <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Three Actionable Recommendations</h3>
                  <p className="text-xs text-slate-400">
                    Confidence scored according to sample sizes and variance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.recommendations?.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-500/40 transition-colors flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 font-mono">REC #{rec.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            rec.confidence === 'High'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : rec.confidence === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {rec.confidence} Confidence
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{rec.action}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400">
                      <p>
                        <strong className="text-slate-300">Data Proof:</strong> {rec.evidence}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="italic text-slate-500 text-[10px] truncate max-w-[160px]">
                          Basis: {rec.confidence_reason}
                        </span>
                        <button
                          onClick={() => handleCopyRecommendation(rec)}
                          className="text-slate-400 hover:text-white"
                          title="Copy Recommendation"
                        >
                          {copiedId === rec.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Five Concrete Experiments for Upcoming Videos */}
            <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">5 Recommended Experiments</h3>
                    <p className="text-xs text-slate-400">
                      Testable hypotheses ready to import into your Weekly Content Planner
                    </p>
                  </div>
                </div>
                <Link
                  href="/planner"
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>Go to Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {report.experiments?.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white">#{exp.id} {exp.title}</span>
                        <GameBadge game={exp.game} size="sm" />
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-cyan-300">
                          {exp.format}
                        </span>
                        <PlatformBadge platform={exp.platform} size="sm" />
                      </div>
                      <p className="text-xs text-slate-300 font-mono">
                        <strong className="text-cyan-400">Hypothesis:</strong> {exp.hypothesis}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Target Metric:</strong> {exp.target_metric}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePushExperimentToPlanner(exp)}
                      className="w-full md:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 md:py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Planner</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Quality Notes */}
            {report.data_quality_notes && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>Data Quality Note: {report.data_quality_notes}</span>
                <span className="text-purple-400 font-mono text-[11px] shrink-0">
                  {videos.length} videos analyzed
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
