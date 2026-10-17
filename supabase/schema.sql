-- ==============================================================================
-- CreatorCoach AI — Supabase PostgreSQL Schema & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    handle TEXT NOT NULL,
    main_games TEXT[] DEFAULT ARRAY['Minecraft', 'Valorant', 'BGMI', 'CODM']::TEXT[],
    audience_type TEXT DEFAULT 'Competitive & Casual Gamers',
    content_niche TEXT DEFAULT 'Clutch plays & game mechanics guides',
    preferred_tone TEXT DEFAULT 'High-energy, tactical, and entertaining',
    primary_platforms TEXT[] DEFAULT ARRAY['youtube_shorts', 'instagram_reels']::TEXT[],
    posting_frequency TEXT DEFAULT '5 videos / week',
    target_views INTEGER DEFAULT 50000,
    target_engagement NUMERIC(5,2) DEFAULT 8.00,
    target_posts INTEGER DEFAULT 5,
    ollama_endpoint TEXT DEFAULT 'http://localhost:11434',
    ollama_model TEXT DEFAULT 'llama3.2:latest',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Videos Table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    game TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram_reels', 'youtube_shorts')),
    content_format TEXT NOT NULL CHECK (content_format IN (
        'Tutorial / Guide',
        'Clutch / Highlight',
        'Fail / Funny',
        'Challenge / Experiment',
        'News / Lore',
        'Review / Tier List'
    )),
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_seconds INTEGER NOT NULL DEFAULT 30,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    retention_rate_pct NUMERIC(5,2),
    url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Video Metrics Snapshots (Historical tracking over time)
CREATE TABLE IF NOT EXISTS public.video_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    views INTEGER NOT NULL,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Coaching Reports Table
CREATE TABLE IF NOT EXISTS public.coaching_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    model_used TEXT NOT NULL,
    summary TEXT NOT NULL,
    top_performing_formats JSONB NOT NULL DEFAULT '[]'::JSONB,
    underperforming_content JSONB NOT NULL DEFAULT '[]'::JSONB,
    recommendations JSONB NOT NULL DEFAULT '[]'::JSONB,
    experiments JSONB NOT NULL DEFAULT '[]'::JSONB,
    data_quality_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Content Ideas & Weekly Planner Table
CREATE TABLE IF NOT EXISTS public.content_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    content_format TEXT NOT NULL,
    working_title TEXT NOT NULL,
    hook TEXT NOT NULL,
    content_outline TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram_reels', 'youtube_shorts')),
    objective TEXT NOT NULL,
    hypothesis_to_test TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Idea' CHECK (status IN ('Idea', 'Scripting', 'Recorded', 'Published')),
    target_date DATE,
    actual_views INTEGER,
    actual_engagement_rate NUMERIC(5,2),
    actual_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Content Experiments Table
CREATE TABLE IF NOT EXISTS public.content_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    game TEXT NOT NULL,
    format TEXT NOT NULL,
    platform TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    target_metric TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Abandoned')),
    result_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal analytics queries
CREATE INDEX IF NOT EXISTS idx_videos_user_date ON public.videos(user_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_game ON public.videos(game);
CREATE INDEX IF NOT EXISTS idx_videos_platform ON public.videos(platform);
CREATE INDEX IF NOT EXISTS idx_videos_format ON public.videos(content_format);
CREATE INDEX IF NOT EXISTS idx_ideas_user_status ON public.content_ideas(user_id, status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_experiments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Ensure users only read and mutate their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can CRUD own videos" ON public.videos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own video metrics" ON public.video_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own coaching reports" ON public.coaching_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own content ideas" ON public.content_ideas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own experiments" ON public.content_experiments FOR ALL USING (auth.uid() = user_id);
