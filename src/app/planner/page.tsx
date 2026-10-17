'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataStore } from '@/lib/data/storage';
import { ContentIdea, IdeaStatus, Game, Platform, ContentFormat } from '@/types';
import { formatNumber, formatPercent } from '@/lib/utils';
import { GameBadge } from '@/components/ui/GameBadge';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import {
  CalendarDays,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Film,
  Eye,
  Flame,
  ArrowRight,
  X,
  Check,
  RotateCcw,
  Lightbulb,
  FileEdit,
  Video,
  CheckCheck,
  TrendingUp,
} from 'lucide-react';

const STATUS_COLUMNS: {
  id: IdeaStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
}[] = [
  {
    id: 'Idea',
    label: 'Concept Ideas',
    icon: Lightbulb,
    color: 'border-slate-500/40 text-slate-400',
    bgGlow: 'from-slate-500/10 to-transparent',
  },
  {
    id: 'Scripting',
    label: 'In Scripting',
    icon: FileEdit,
    color: 'border-amber-500/40 text-amber-400',
    bgGlow: 'from-amber-500/10 to-transparent',
  },
  {
    id: 'Recorded',
    label: 'Recorded & Edited',
    icon: Video,
    color: 'border-cyan-500/40 text-cyan-400',
    bgGlow: 'from-cyan-500/10 to-transparent',
  },
  {
    id: 'Published',
    label: 'Published & Tracking',
    icon: CheckCheck,
    color: 'border-emerald-500/40 text-emerald-400',
    bgGlow: 'from-emerald-500/10 to-transparent',
  },
];

export default function PlannerPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Edit / Record Performance Modal State
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loaded = DataStore.getWeeklyPlan();
    setIdeas(loaded);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: IdeaStatus) => {
    const current = ideas.find((i) => i.id === id);
    if (!current) return;
    const updatedIdea = { ...current, status: newStatus };
    const updatedList = DataStore.saveContentIdea(updatedIdea);
    setIdeas(updatedList);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this video idea from your sprint?')) {
      const updated = DataStore.deleteContentIdea(id);
      setIdeas(updated);
    }
  };

  const handleGenerateFreshPlan = async (useDemo: boolean = false) => {
    setIsGenerating(true);
    setErrorNotice(null);

    try {
      const profile = DataStore.getProfile();
      const videos = DataStore.getVideos();

      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          videos,
          endpoint: profile.ai_model_config.endpoint,
          model: profile.ai_model_config.model,
          useDemoFallback: useDemo,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(
          data.error ||
            'Could not generate plan with Ollama. Click "Sample Concepts" for instant demo concepts.'
        );
      } else {
        const combined = [...data.ideas, ...ideas];
        DataStore.saveWeeklyPlan(combined);
        setIdeas(combined);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setErrorNotice(`Network failure: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveModal = (updated: ContentIdea) => {
    const saved = DataStore.saveContentIdea(updated);
    setIdeas(saved);
    setIsEditModalOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-violet-600/15 via-cyan-500/10 to-transparent blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                  Sprint Pipeline
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Target: 5 Videos / Wk
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Weekly Gaming Video Planner
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Turn AI insights into tested short-form hypotheses. Track production stages and log actual post-publish views and retention.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleGenerateFreshPlan(false)}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-600/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Synthesizing...' : 'AI Generate 5 Concepts'}</span>
              </button>

              <button
                onClick={() => handleGenerateFreshPlan(true)}
                className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 transition-all cursor-pointer"
              >
                Sample Concepts
              </button>

              <button
                onClick={() => {
                  const newBlank: ContentIdea = {
                    id: `plan-manual-${Date.now()}`,
                    game: 'CODM',
                    content_format: 'Clutch / Highlight',
                    working_title: 'New Video Concept',
                    hook: 'Opening 2-second hook line',
                    content_outline: 'Rough story outline',
                    platform: 'youtube_shorts',
                    objective: 'Drive engagement & shares',
                    hypothesis_to_test: 'Test snappy quick-cut pacing',
                    status: 'Idea',
                    created_at: '2026-10-17T00:00:00.000Z',
                  };
                  setSelectedIdea(newBlank);
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-violet-400" />
                <span>New Concept</span>
              </button>
            </div>
          </div>
        </div>

        {errorNotice && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorNotice}</span>
            <button
              onClick={() => handleGenerateFreshPlan(true)}
              className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-200 font-semibold hover:bg-rose-500/30 transition-colors"
            >
              Load Sample Concepts
            </button>
          </div>
        )}

        {/* Kanban Board of Video Ideas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {STATUS_COLUMNS.map((col) => {
            const columnIdeas = ideas.filter((i) => i.status === col.id);
            const ColumnIcon = col.icon;
            return (
              <div
                key={col.id}
                className="rounded-2xl glass-panel p-4 flex flex-col space-y-3 min-h-[540px] relative overflow-hidden"
              >
                {/* Column Header Glow */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${col.bgGlow}`}
                />

                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-white/[0.04]">
                      <ColumnIcon className={`w-3.5 h-3.5 ${col.color.split(' ')[1]}`} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-mono font-bold">
                    {columnIdeas.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnIdeas.length === 0 ? (
                    <div className="h-36 flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-white/[0.08] rounded-xl p-4 text-center">
                      <ColumnIcon className="w-5 h-5 mb-1.5 opacity-30" />
                      <span>No clips in this stage</span>
                    </div>
                  ) : (
                    columnIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className="p-4 rounded-xl bg-[#0e121d] border border-white/[0.08] hover:border-violet-500/40 hover:bg-[#121625] transition-all space-y-3 group shadow-lg"
                      >
                        {/* Tags */}
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <GameBadge game={idea.game} />
                            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 text-[10px]">
                              {idea.content_format.split('/')[0]}
                            </span>
                          </div>
                          <PlatformBadge platform={idea.platform} />
                        </div>

                        {/* Title & Hook */}
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white leading-snug group-hover:text-violet-300 transition-colors">
                            {idea.working_title}
                          </h4>
                          <p className="text-xs text-slate-300 italic line-clamp-2">
                            &quot;{idea.hook}&quot;
                          </p>
                        </div>

                        {/* Hypothesis preview */}
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] text-slate-400">
                          <strong className="text-slate-300 block text-[10px] uppercase tracking-wider">Hypothesis:</strong>
                          <span className="line-clamp-2">{idea.hypothesis_to_test}</span>
                        </div>

                        {/* Published actuals if recorded */}
                        {idea.status === 'Published' && idea.actual_views !== null && idea.actual_views !== undefined && (
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatNumber(idea.actual_views)} views
                              </span>
                              <span className="text-emerald-400 font-mono">
                                {formatPercent(idea.actual_engagement_rate)} eng
                              </span>
                            </div>
                            {idea.actual_notes && (
                              <p className="text-[10px] text-emerald-400/90 leading-tight">{idea.actual_notes}</p>
                            )}
                          </div>
                        )}

                        {/* Status switcher & actions */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                          <select
                            value={idea.status}
                            onChange={(e) =>
                              handleUpdateStatus(idea.id, e.target.value as IdeaStatus)
                            }
                            className="bg-[#141824] border border-white/[0.1] rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-violet-500"
                          >
                            <option value="Idea">Idea</option>
                            <option value="Scripting">Scripting</option>
                            <option value="Recorded">Recorded</option>
                            <option value="Published">Published</option>
                          </select>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedIdea(idea);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                              title="Edit / Record Performance"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(idea.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Idea"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Idea & Record Performance Modal */}
      {isEditModalOpen && selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#0f121d] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Edit Video Plan & Performance
                </h3>
                <p className="text-xs text-slate-400">Update script outline or record actual metrics.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Working Title
                </label>
                <input
                  type="text"
                  value={selectedIdea.working_title}
                  onChange={(e) =>
                    setSelectedIdea({ ...selectedIdea, working_title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Game</label>
                  <select
                    value={selectedIdea.game}
                    onChange={(e) =>
                      setSelectedIdea({ ...selectedIdea, game: e.target.value as Game })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Minecraft">Minecraft</option>
                    <option value="Valorant">Valorant</option>
                    <option value="CODM">CODM (Call of Duty: Mobile)</option>
                    <option value="BGMI">BGMI</option>
                    <option value="Apex Legends">Apex Legends</option>
                    <option value="GTA V">GTA V</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={selectedIdea.status}
                    onChange={(e) =>
                      setSelectedIdea({ ...selectedIdea, status: e.target.value as IdeaStatus })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#141824] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Scripting">Scripting</option>
                    <option value="Recorded">Recorded</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Hook</label>
                <textarea
                  rows={2}
                  value={selectedIdea.hook}
                  onChange={(e) => setSelectedIdea({ ...selectedIdea, hook: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hypothesis Being Tested
                </label>
                <textarea
                  rows={2}
                  value={selectedIdea.hypothesis_to_test}
                  onChange={(e) =>
                    setSelectedIdea({ ...selectedIdea, hypothesis_to_test: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Actual performance inputs for published clips */}
              <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-3">
                <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
                  Post-Publish Actual Performance
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Actual Views</label>
                    <input
                      type="number"
                      placeholder="e.g. 42000"
                      value={selectedIdea.actual_views ?? ''}
                      onChange={(e) =>
                        setSelectedIdea({
                          ...selectedIdea,
                          actual_views: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      Actual Engagement (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 9.2"
                      value={selectedIdea.actual_engagement_rate ?? ''}
                      onChange={(e) =>
                        setSelectedIdea({
                          ...selectedIdea,
                          actual_engagement_rate:
                            e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Outcome Notes vs Hypothesis
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High save rate confirmed; reached 114% retention loop."
                    value={selectedIdea.actual_notes || ''}
                    onChange={(e) =>
                      setSelectedIdea({ ...selectedIdea, actual_notes: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveModal(selectedIdea)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-cyan-500 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

