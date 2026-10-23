'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { GameBadge } from '@/components/ui/GameBadge';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import {
  Sparkles,
  BarChart3,
  CalendarDays,
  PenTool,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight,
  Zap,
  TrendingUp,
  Flame,
  HelpCircle,
  Eye,
  Heart,
  Share2,
  Video,
  Play,
  RotateCcw,
  Check,
  Menu,
  X,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const faqs = [
    {
      q: 'Why build specifically for gaming short-form creators?',
      a: 'Short-form gaming algorithms operate on split-second visual dynamics. Early retention in the first 1.8 seconds, weapon audio loops, and intense clutch moments directly dictate whether your Minecraft, Valorant, CODM, or BGMI clip escapes the 800-view sandbox.',
    },
    {
      q: 'How does open-source AI protect creator data?',
      a: 'CreatorCoach AI communicates with Ollama running open-weight instruction models (such as Llama 3.2, Mistral, or Qwen 2.5). Your raw gameplay analytics, unreleased hooks, and creative blueprints stay on your own infrastructure rather than being harvested by closed commercial APIs.',
    },
    {
      q: 'Do I need to install Ollama to test the app right now?',
      a: 'No. The platform comes with an instant zero-setup Demo Mode pre-loaded with 18 realistic gaming clips and verified coaching reports so you can immediately explore the full experience without installing anything.',
    },
    {
      q: 'How is the Engagement Rate calculated?',
      a: 'We use the mathematically strict formula: ((likes + comments + shares) / views) × 100. If any of those metrics were uncollected on export, our engine omits the metric from the denominator calculation rather than falsely treating it as zero.',
    },
    {
      q: 'Which games are supported?',
      a: 'CreatorCoach AI is optimized for top short-form gaming titles including Minecraft, Valorant, CODM (Call of Duty: Mobile), BGMI, and other mobile or PC esports titles.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col selection:bg-purple-500/30 overflow-x-hidden">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#06070a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-purple-300 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-purple-300 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-purple-300 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-purple-300 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors hidden xs:inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#090b10] px-4 pt-3 pb-5 space-y-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.05]"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.05]"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.05]"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.05]"
              >
                FAQ
              </a>
            </div>

            <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 border border-white/[0.08]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-semibold text-white shadow-md shadow-purple-600/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section: Two-Column Layout */}
      <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-full max-w-[500px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-full max-w-[450px] h-[300px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-[11px] font-bold text-purple-300 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>AI-POWERED CREATOR GROWTH</span>
            </div>

            {/* Headline with Electric Violet-to-Cyan Gradient */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Turn Every Clip Into Your{' '}
              <span className="gradient-text-electric">Next Big Move.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Stop guessing why your short-form gameplay stalled at 800 views. Get objective creator
              analytics, open-weight AI coaching, high-retention hooks, and testable weekly sprint plans
              tailored for Minecraft, Valorant, CODM, and BGMI.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/coach"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Start Coaching</span>
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 hover:text-white transition-all"
              >
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Explore Dashboard</span>
              </Link>
            </div>

            {/* Small supporting text */}
            <p className="text-xs text-slate-500 flex items-center gap-2 pt-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Built for gaming creators. Powered by open-source AI.</span>
            </p>
          </div>

          {/* Right Column: Polished Dashboard Preview Card */}
          <div className="lg:col-span-6 relative">
            {/* Glow backdrop behind preview */}
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-cyan-500/30 blur-2xl opacity-70" />

            <div className="relative rounded-2xl bg-[#0d101a] border border-white/[0.12] p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-xl">
              {/* Header preview row */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                    AV
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">ApexVortex Gaming</h3>
                    <p className="text-[10px] text-slate-400">@apexvortex_clips • CODM & Valorant</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold font-mono">
                  Demo Data Active
                </span>
              </div>

              {/* 3 Mini Metric Panels */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-left">
                <div className="p-2 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 block uppercase">Views</span>
                  <span className="text-sm sm:text-lg font-black text-white truncate block">528.9K</span>
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 block font-medium truncate">+34% reach</span>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 block uppercase">Eng. Rate</span>
                  <span className="text-sm sm:text-lg font-black text-white truncate block">9.2%</span>
                  <span className="text-[9px] sm:text-[10px] text-cyan-400 block font-medium truncate">Valid denom.</span>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 block uppercase">Baseline</span>
                  <span className="text-sm sm:text-lg font-black text-white truncate block">29.4K</span>
                  <span className="text-[9px] sm:text-[10px] text-purple-400 block font-medium truncate">18 clips</span>
                </div>
              </div>

              {/* Mini Trend Line Representation */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] text-left space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">Recent Retention Velocity</span>
                  <span className="text-purple-400 font-mono font-bold">Peak: 46.2K</span>
                </div>
                {/* SVG Sparkline */}
                <div className="h-14 w-full flex items-end">
                  <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,45 Q 30,35 60,40 T 120,20 T 180,30 T 240,10 T 300,18 L 300,60 L 0,60 Z"
                      fill="url(#heroGradient)"
                    />
                    <path
                      d="M 0,45 Q 30,35 60,40 T 120,20 T 180,30 T 240,10 T 300,18"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Mini Video List */}
              <div className="space-y-1.5 text-left text-xs">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <GameBadge game="CODM" size="sm" />
                    <span className="font-medium text-white truncate">1v4 S&D Clutch on Standoff</span>
                  </div>
                  <span className="font-bold text-purple-400 font-mono text-[11px] shrink-0">33.7K</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <GameBadge game="Valorant" size="sm" />
                    <span className="font-medium text-white truncate">Haven A Site Shock Dart Double</span>
                  </div>
                  <span className="font-bold text-purple-400 font-mono text-[11px] shrink-0">38.4K</span>
                </div>
              </div>

              {/* Mini AI Insight Panel */}
              <div className="p-3 rounded-xl bg-purple-500/[0.06] border border-purple-500/25 text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong className="text-white block font-semibold">AI Recommendation (High Confidence):</strong>
                  <p className="text-slate-300 mt-0.5">
                    Fast weapon mechanics and sub-40s tutorials generate +26% higher average reach and 2.4x more saves than slow tier lists.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Performance Analytics */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400">
            <BarChart3 className="w-4 h-4" />
            <span>Deterministic Math Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Clarity Over Vanity Metrics
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Stop guessing your true audience retention. CreatorCoach AI benchmarks every reel against your
            own catalog average with mathematically rigorous engagement denominators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] hover:border-purple-500/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Catalog Baseline Comparison</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every video is indexed against your own historic performance baseline rather than arbitrary global averages.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] hover:border-indigo-500/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Strict Denominator Math</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Formula: ((likes + comments + shares) / views) × 100. Missing attributes are never forced to zero.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] hover:border-cyan-500/30 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Format Breakdowns</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Separate clutches from tutorials, funny fails, and challenge runs across Minecraft, Valorant, CODM, and BGMI.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: AI Coaching & Epistemic Honesty */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>Diagnostic Reasoning</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              An AI Coach That Refuses To Lie To You
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Most creator tools churn out generic AI advice promising guaranteed virality. CreatorCoach AI
              separates observed metrics from causal hypotheses. Every recommendation includes data evidence,
              sample sizes, and confidence levels.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Correlation is explicitly separated from platform causation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Generates 3 actionable recommendations and 5 testable video experiments</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Runs on private open-weight models via Ollama (Llama 3.2, Mistral, Qwen 2.5)</span>
              </li>
            </ul>

            <Link
              href="/coach"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 pt-2"
            >
              <span>Explore AI Coach Experience</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0d101a] border border-white/[0.08] space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">OBSERVED PATTERN</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  High Confidence
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Climax Hooks Under 1.8s Lift Completion</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clips leading with a 0.5s headshot or explosion impact before rewinding to "How we pulled this off"
                exhibited 74% 3-second retention vs 48% on slower narrative builds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d101a] border border-white/[0.08] space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">TESTED HYPOTHESIS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  Medium Confidence
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Interactive Weapon Comparisons vs Tier Lists</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                HYPOTHESIS: Static tier lists provoke debate comments but suffer lower share velocity than actionable
                side-by-side recoil sprays (e.g. CODM CBR4 vs Switchblade).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Content Studio & Weekly Planner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400">
            <PenTool className="w-4 h-4" />
            <span>Content Studio & Weekly Sprint</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            From Raw Stats to Scheduled Uploads
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Generate 3 hook angles, full timestamped voiceovers, on-screen text placements, and track 5 weekly concepts
            across your production lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] text-left space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Content Studio</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Input game, format, platform, and tone. Synthesize 3 hook variations (Shock, Curiosity, Action Climax),
              scene breakdowns, captions, and Reels vs Shorts adaptations.
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] text-left space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Weekly Sprint Planner</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Track video ideas across 4 stages: Idea, Scripting, Recorded, and Published. Once live, log actual views
              and engagement to compare against your original hypothesis.
            </p>
            <Link
              href="/planner"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>Open Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Simple 3-Step Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How CreatorCoach AI Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] space-y-3">
            <div className="text-2xl font-black text-purple-400 font-mono">01</div>
            <h4 className="text-base font-bold text-white">Log or Import Clips</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Import YouTube Studio or Instagram Insights CSV files, or enter clips manually. Missing metrics are safely preserved.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] space-y-3">
            <div className="text-2xl font-black text-indigo-400 font-mono">02</div>
            <h4 className="text-base font-bold text-white">Receive Diagnostic Coaching</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Our deterministic analytics engine calculates catalog baselines, while open-weight AI identifies 3 recommendations and 5 experiments.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] space-y-3">
            <div className="text-2xl font-black text-cyan-400 font-mono">03</div>
            <h4 className="text-base font-bold text-white">Script & Execute in Sprint</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Generate retention hooks in Content Studio, organize your next 5 videos in the Weekly Planner, and record actual post-publish metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Predictable & Open
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Transparent Creator Pricing</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Self-host for free with your own Ollama runtime, or upgrade for turnkey managed GPU inference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
          {/* Plan 1 */}
          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Open-Source</span>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Self-hosted with local Ollama runtime and Supabase.</p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited Video Imports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Deterministic Analytics Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Local Ollama Integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Content Studio & Weekly Planner</span>
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 w-full py-2.5 rounded-xl font-semibold text-xs text-center bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white transition-all block"
            >
              Start Free Demo
            </Link>
          </div>

          {/* Plan 2: Pro */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#161a29] to-[#0d101a] border border-purple-500/40 shadow-xl shadow-purple-600/10 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[10px] font-black uppercase tracking-wider text-white">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Creator Pro</span>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$14</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">For active short-form gaming channels posting 4+ reels weekly.</p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Everything in Open-Source</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Hosted High-Speed GPU Open Models</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Cross-Platform Engagement Benchmarking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Cloud Database Auto-Sync</span>
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 w-full py-2.5 rounded-xl font-bold text-xs text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all block"
            >
              Get Started with Pro
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="p-6 rounded-2xl bg-[#0d101a] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team / Esports Org</span>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">For multi-creator rosters, streamer guilds, and esports teams.</p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Up to 10 Creator Profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Collaborative Script Studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Custom Fine-Tuned Model Weights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Priority Support</span>
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-8 w-full py-2.5 rounded-xl font-semibold text-xs text-center bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white transition-all block"
            >
              Contact Team Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6: FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full border-t border-white/[0.06]">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4 text-left">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0d101a] border border-white/[0.08] hover:border-white/[0.12] transition-colors"
            >
              <h3 className="text-sm sm:text-base font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: Final CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/40 via-[#101422] to-cyan-900/40 border border-purple-500/30 p-8 sm:p-14 text-center overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ready to Upgrade Your Gaming Content Velocity?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Launch into the free working demo right now. No credit card, no registration, and no external AI models required to explore.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:opacity-90 text-white shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02]"
              >
                Launch CreatorCoach AI
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#050608] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <Logo size="sm" />
            <span className="text-slate-500">— Open-Weight Growth Coach for Gaming Creators</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="hover:text-purple-300">
              Dashboard
            </Link>
            <Link href="/analytics" className="hover:text-purple-300">
              Analytics
            </Link>
            <Link href="/coach" className="hover:text-purple-300">
              AI Coach
            </Link>
            <Link href="/studio" className="hover:text-purple-300">
              Studio
            </Link>
            <Link href="/planner" className="hover:text-purple-300">
              Planner
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              className="hover:text-white flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
