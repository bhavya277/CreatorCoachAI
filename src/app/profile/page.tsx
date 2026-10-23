'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataService, DataStore } from '@/lib/data/storage';
import { CreatorProfile, Game, Platform } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';                
import {
  Settings,
  User,
  Gamepad2,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Target,
  Globe,
  Radio,
  Flame,
  ShieldCheck,
} from 'lucide-react';

const AVAILABLE_GAMES: Game[] = [
  'Minecraft',
  'Valorant',
  'CODM',
  'BGMI',
  'Apex Legends',
  'GTA V',
  'Other',
];

export default function ProfileSettingsPage() {
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{
    tested: boolean;
    online: boolean;
    models: string[];
    error?: string;
  }>({
    tested: false,
    online: false,
    models: [],
  });
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const loaded = await DataService.getProfile();
    setProfile(loaded);
  };

  const handleTestOllama = async () => {
    if (!profile) return;
    setTestingOllama(true);
    try {
      const endpoint = profile.ai_model_config.endpoint;
      const res = await fetch(`/api/ai/health?endpoint=${encodeURIComponent(endpoint)}`);
      const data = await res.json();
      setOllamaStatus({
        tested: true,
        online: data.isOnline,
        models: data.models || [],
        error: data.error,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      setOllamaStatus({
        tested: true,
        online: false,
        models: [],
        error: msg,
      });
    } finally {
      setTestingOllama(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await DataService.saveProfile(profile);
    await refreshProfile();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const toggleGame = (game: Game) => {
    if (!profile) return;
    const exists = profile.main_games.includes(game);
    const updated = exists
      ? profile.main_games.filter((g) => g !== game)
      : [...profile.main_games, game];
    setProfile({ ...profile, main_games: updated });
  };

  const togglePlatform = (p: Platform) => {
    if (!profile) return;
    const exists = profile.primary_platforms.includes(p);
    const updated = exists
      ? profile.primary_platforms.filter((plat) => plat !== p)
      : [...profile.primary_platforms, p];
    setProfile({ ...profile, primary_platforms: updated });
  };

  if (!profile) return null;

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-4 sm:p-8">
          <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-violet-600/15 via-cyan-500/10 to-transparent blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                  Channel Customization
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-mono">
                  {profile.handle}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Creator Profile & Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Configure your gaming niche, weekly growth targets, and open-source AI inference endpoints.
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('Reset all creator data, videos, and planner back to default demo state?')) {
                  DataStore.resetToDemoData();
                  window.location.reload();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-violet-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all cursor-pointer w-fit"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {savedNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Creator profile and AI settings successfully saved!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Basic Creator Identity */}
          <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-5">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/[0.08]">
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Creator Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Creator Name
                </label>
                <input
                  type="text"
                  required
                  value={profile.creator_name}
                  onChange={(e) => setProfile({ ...profile, creator_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Social Handle
                </label>
                <input
                  type="text"
                  required
                  value={profile.handle}
                  onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Main Games Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Main Featured Games (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GAMES.map((g) => {
                  const selected = profile.main_games.includes(g);
                  const label = g === 'CODM' ? 'CODM (Call of Duty: Mobile)' : g;
                  return (
                    <button
                      type="button"
                      key={g}
                      onClick={() => toggleGame(g)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selected
                          ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border-violet-500 text-violet-200 shadow-sm'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Primary Short-Form Platforms
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => togglePlatform('youtube_shorts')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                    profile.primary_platforms.includes('youtube_shorts')
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  YouTube Shorts
                </button>
                <button
                  type="button"
                  onClick={() => togglePlatform('instagram_reels')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                    profile.primary_platforms.includes('instagram_reels')
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  Instagram Reels
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Content Strategy & Style */}
          <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/[0.08]">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Content Strategy & Persona
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Audience Type
                </label>
                <input
                  type="text"
                  value={profile.audience_type}
                  onChange={(e) => setProfile({ ...profile, audience_type: e.target.value })}
                  placeholder="e.g. Competitive ranked players, beginners, casuals"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Content Niche
                </label>
                <input
                  type="text"
                  value={profile.content_niche}
                  onChange={(e) => setProfile({ ...profile, content_niche: e.target.value })}
                  placeholder="e.g. Clutch plays, hidden mechanics & loadout guides"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Preferred Delivery Tone
                </label>
                <input
                  type="text"
                  value={profile.preferred_tone}
                  onChange={(e) => setProfile({ ...profile, preferred_tone: e.target.value })}
                  placeholder="e.g. High-energy, tactical with punchy banter"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Posting Cadence
                </label>
                <input
                  type="text"
                  value={profile.posting_frequency}
                  onChange={(e) => setProfile({ ...profile, posting_frequency: e.target.value })}
                  placeholder="e.g. 5 short-form clips / week"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Weekly Target Goals */}
          <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/[0.08]">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Weekly Growth Sprint Goals
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Views / Week
                </label>
                <input
                  type="number"
                  value={profile.weekly_goals.target_views}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      weekly_goals: {
                        ...profile.weekly_goals,
                        target_views: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Engagement Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weekly_goals.target_engagement}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      weekly_goals: {
                        ...profile.weekly_goals,
                        target_engagement: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Weekly Target Uploads
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={profile.weekly_goals.target_posts}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      weekly_goals: {
                        ...profile.weekly_goals,
                        target_posts: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Open-Source AI Model Configuration (Ollama) */}
          <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Open-Weight AI Inference (Ollama)
                </h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold">
                Open-Source Only
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Configure your local or self-hosted Ollama server. No proprietary closed AI APIs are used.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ollama Base URL Endpoint
                </label>
                <input
                  type="text"
                  value={profile.ai_model_config.endpoint}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      ai_model_config: {
                        ...profile.ai_model_config,
                        endpoint: e.target.value,
                      },
                    })
                  }
                  placeholder="http://127.0.0.1:11434"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Open-Weight Model Name
                </label>
                <input
                  type="text"
                  value={profile.ai_model_config.model}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      ai_model_config: {
                        ...profile.ai_model_config,
                        model: e.target.value,
                      },
                    })
                  }
                  placeholder="llama3.2:latest, mistral, qwen2.5:7b"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Test Connection Button & Status */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestOllama}
                disabled={testingOllama}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 transition-all cursor-pointer w-full sm:w-fit justify-center"
              >
                <Radio className="w-3.5 h-3.5 text-violet-400" />
                <span>{testingOllama ? 'Connecting to Ollama...' : 'Test Connection'}</span>
              </button>

              {ollamaStatus.tested && (
                <div className="text-xs">
                  {ollamaStatus.online ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Online! Found {ollamaStatus.models.length} installed model(s):{' '}
                        {ollamaStatus.models.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>{ollamaStatus.error || 'Connection timed out. Ensure ollama serve is active.'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Database Status (Supabase) */}
          <div className="p-4 sm:p-6 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/[0.08]">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Database & Cloud Storage
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-200 block">Supabase PostgreSQL:</span>
                <span className="text-slate-400">
                  {isSupabaseConfigured
                    ? 'Connected via NEXT_PUBLIC_SUPABASE_URL and Anon key'
                    : 'Running in Zero-Setup Demo Mode (LocalStorage Persistence)'}
                </span>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full font-semibold border w-fit ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                }`}
              >
                {isSupabaseConfigured ? 'Connected' : 'Demo Mode Active'}
              </span>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-xl shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

