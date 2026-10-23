'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { GameBadge } from '@/components/ui/GameBadge';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { DataStore } from '@/lib/data/storage';
import { Game, Platform, ContentFormat, ScriptGeneration, ContentIdea } from '@/types';
import {
  PenTool,
  Sparkles,
  Copy,
  Check,
  CalendarDays,
  RotateCcw,
  Layers,
  Film,
  Type,
  Share2,
  Sliders,
  Loader2,
  Trash2,
} from 'lucide-react';

export default function StudioPage() {
  const [game, setGame] = useState<Game>('CODM');
  const [contentFormat, setContentFormat] = useState<ContentFormat>('Tutorial / Guide');
  const [platform, setPlatform] = useState<Platform>('youtube_shorts');
  const [targetAudience, setTargetAudience] = useState('Competitive mobile FPS ranked grinders');
  const [tone, setTone] = useState('High-energy & Direct');
  const [videoLength, setVideoLength] = useState('30-45s');
  const [contentObjective, setContentObjective] = useState('Drive saves and shares with immediate tactical utility');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<ScriptGeneration | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedToPlanNotice, setSavedToPlanNotice] = useState(false);

  const handleGenerate = async (useDemo: boolean = false) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSavedToPlanNotice(false);

    try {
      const profile = DataStore.getProfile();
      const res = await fetch('/api/ai/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game,
          content_format: contentFormat,
          platform,
          target_audience: targetAudience,
          tone,
          video_length: videoLength,
          content_objective: contentObjective,
          endpoint: profile.ai_model_config.endpoint,
          model: profile.ai_model_config.model,
          useDemoFallback: useDemo,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.error ||
            'Could not connect to Ollama. Click "Generate Instant Script" to preview the output without local inference.'
        );
      } else {
        setGeneratedScript(data.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setErrorMsg(`Network error: ${msg}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveToWeeklyPlanner = () => {
    if (!generatedScript) return;

    const chosenHook = generatedScript.hooks[0]?.text || 'Hook for video';
    const newIdea: ContentIdea = {
      id: `plan-studio-${Date.now()}`,
      game: generatedScript.game,
      content_format: generatedScript.content_format,
      working_title: `${generatedScript.game} ${generatedScript.content_format} Blueprint`,
      hook: chosenHook,
      content_outline: generatedScript.script,
      platform: generatedScript.platform,
      objective: generatedScript.content_objective,
      hypothesis_to_test: 'Sub-40s guide format with text overlays lifts completion above 75%',
      status: 'Scripting',
      created_at: '2026-10-17T12:00:00.000Z',
    };

    DataStore.saveContentIdea(newIdea);
    setSavedToPlanNotice(true);
    setTimeout(() => setSavedToPlanNotice(false), 3500);
  };

  return (
    <AppShell>
      <div className="space-y-8 text-left">
        {/* Header */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Short-Form Video Production
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                YouTube Shorts & Instagram Reels
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              AI Gaming Content Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Generate 3 alternate opening hooks, complete voiceovers, scene breakdowns, on-screen text, and platform adaptations.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleGenerate(true)}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-slate-200 hover:text-white transition-all text-center"
            >
              Generate Instant Script
            </button>
          </div>
        </div>

        {/* Notices */}
        {savedToPlanNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4" />
              <span>Saved this script directly into your Weekly Planner in "Scripting" stage!</span>
            </div>
            <Link href="/planner" className="font-bold underline hover:text-emerald-300">
              View Planner
            </Link>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>{errorMsg}</span>
            <button
              onClick={() => handleGenerate(true)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-semibold text-rose-200 shrink-0"
            >
              Generate with Sample Engine
            </button>
          </div>
        )}

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Configuration Panel (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-5 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
              <Sliders className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Content Parameters
              </h2>
            </div>

            {/* Game Selector (CODM, Valorant, Minecraft, BGMI) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Game
              </label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value as Game)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141826] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="CODM">CODM (Call of Duty: Mobile)</option>
                <option value="Valorant">Valorant</option>
                <option value="Minecraft">Minecraft</option>
                <option value="BGMI">BGMI (Battlegrounds Mobile)</option>
                <option value="Apex Legends">Apex Legends</option>
                <option value="GTA V">GTA V</option>
                <option value="Other">Other Popular Game</option>
              </select>
            </div>

            {/* Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Content Format
              </label>
              <select
                value={contentFormat}
                onChange={(e) => setContentFormat(e.target.value as ContentFormat)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141826] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Tutorial / Guide">Tutorial / Guide (Mechanics & Secrets)</option>
                <option value="Clutch / Highlight">Clutch / Highlight (High Stakes)</option>
                <option value="Fail / Funny">Fail / Funny (Memes & Chaos)</option>
                <option value="Challenge / Experiment">Challenge / Experiment (Can we win with...?)</option>
                <option value="News / Lore">News / Lore (Patch notes & meta changes)</option>
                <option value="Review / Tier List">Review / Tier List (Debate starters)</option>
              </select>
            </div>

            {/* Platform Segmented Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlatform('youtube_shorts')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    platform === 'youtube_shorts'
                      ? 'bg-red-500/20 border-red-500/50 text-red-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  YouTube Shorts
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('instagram_reels')}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    platform === 'instagram_reels'
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  Instagram Reels
                </button>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Competitive ranked players, beginners, casuals"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Tone & Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141826] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="High-energy & Direct">High-energy & Direct</option>
                  <option value="Analytical & Tactical">Analytical & Tactical</option>
                  <option value="Humorous & Relatable">Humorous & Relatable</option>
                  <option value="Deadpan / Calm">Deadpan / Calm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Length</label>
                <select
                  value={videoLength}
                  onChange={(e) => setVideoLength(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#141826] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="20-30s">20-30s (Ultra fast)</option>
                  <option value="30-45s">30-45s (Balanced)</option>
                  <option value="50-60s">50-60s (Deep guide)</option>
                </select>
              </div>
            </div>

            {/* Content Objective */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Content Objective
              </label>
              <input
                type="text"
                value={contentObjective}
                onChange={(e) => setContentObjective(e.target.value)}
                placeholder="e.g. Maximize saves, spark comment debate, high watch-time loop"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={() => handleGenerate(false)}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white shadow-xl shadow-purple-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Synthesizing Studio Script...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Generate Full Script & Hooks</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Generated Output Area (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!generatedScript ? (
              <div className="p-12 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl text-center flex flex-col items-center justify-center space-y-4 h-full min-h-[460px]">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center justify-center">
                  <Film className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">No Script Generated Yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                  Choose your game (including CODM, Valorant, Minecraft, or BGMI) on the left, then click{' '}
                  <strong className="text-purple-300">"Generate Full Script & Hooks"</strong> or{' '}
                  <strong className="text-slate-300">"Generate Instant Script"</strong>.
                </p>
                <button
                  onClick={() => handleGenerate(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all"
                >
                  Generate Sample CODM / Gaming Script
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Script Bar Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <GameBadge game={generatedScript.game} />
                    <span className="font-semibold text-white">{generatedScript.content_format}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-purple-400 font-mono font-semibold">{generatedScript.video_length}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSaveToWeeklyPlanner}
                      className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 transition-all"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Save to Planner</span>
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${generatedScript.script}\n\nCaption:\n${generatedScript.caption}\n\n${generatedScript.hashtags.join(' ')}`,
                          'all'
                        )
                      }
                      className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-all"
                    >
                      {copiedField === 'all' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Everything</span>
                    </button>
                  </div>
                </div>

                {/* 3 Alternative Hooks */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      3 Alternative Opening Hooks (First 2.5s)
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {generatedScript.hooks.map((h) => (
                      <div
                        key={h.id}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/30 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
                            Hook Option {h.id} ({h.style})
                          </span>
                          <p className="text-slate-200 font-medium">"{h.text}"</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(h.text, `hook-${h.id}`)}
                          className="shrink-0 p-1.5 rounded text-slate-400 hover:text-white"
                          title="Copy Hook"
                        >
                          {copiedField === `hook-${h.id}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voiceover Script */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Spoken Narration Script
                      </h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedScript.script, 'script')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedField === 'script' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Script</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {generatedScript.script}
                  </div>
                </div>

                {/* Scene Outline */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Scene-by-Scene Visual Outline</span>
                  </h3>

                  <div className="space-y-2.5">
                    {generatedScript.scene_outline.map((scene) => (
                      <div
                        key={scene.scene_num}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3"
                      >
                        <div className="sm:col-span-2 text-cyan-400 font-mono font-bold flex sm:block items-center justify-between">
                          <span>Scene {scene.scene_num}</span>
                          <span className="text-[10px] text-slate-500 font-normal sm:block">{scene.duration_estimate}</span>
                        </div>
                        <div className="sm:col-span-5 text-slate-300">
                          <strong className="text-white block text-[11px] mb-0.5">Visual:</strong>
                          {scene.visual}
                        </div>
                        <div className="sm:col-span-5 text-slate-400 sm:border-l border-white/[0.06] sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0">
                          <strong className="text-slate-200 block text-[11px] mb-0.5">Spoken:</strong>
                          "{scene.audio_speech}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlays, Caption, Hashtags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-3">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Type className="w-4 h-4" />
                      <span>On-Screen Text Overlays</span>
                    </h3>
                    <div className="space-y-1.5">
                      {generatedScript.on_screen_text.map((txt, i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-xs text-slate-200 font-mono"
                        >
                          {txt}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06]">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">CTA:</span>
                      <p className="text-xs text-white font-medium">{generatedScript.call_to_action}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#0d101a] border border-white/[0.08] shadow-xl space-y-3">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-4 h-4" />
                      <span>Caption & Hashtags</span>
                    </h3>
                    <p className="text-xs text-slate-300 whitespace-pre-line bg-black/30 p-2.5 rounded-lg font-mono">
                      {generatedScript.caption}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {generatedScript.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Platform Adaptation */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-[#101422] to-cyan-900/20 border border-purple-500/25 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Platform Adaptation ({generatedScript.platform_adaptation.platform})
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {generatedScript.platform_adaptation.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
