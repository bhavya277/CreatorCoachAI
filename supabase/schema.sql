-- ==============================================================================
-- CreatorCoach AI — Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Master Reference Schema (Sync with supabase/migrations)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL DEFAULT 'Creator',
    display_name TEXT,
    handle TEXT NOT NULL DEFAULT '@creator',
    avatar_url TEXT,
    primary_platform TEXT DEFAULT 'youtube_shorts',
    primary_game TEXT DEFAULT 'CODM',
    main_games TEXT[] DEFAULT ARRAY['CODM', 'Valorant', 'Minecraft', 'BGMI']::TEXT[],
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
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    game TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram_reels', 'youtube_shorts')),
    content_format TEXT NOT NULL DEFAULT 'Clutch / Highlight' CHECK (content_format IN (
        'Tutorial / Guide',
        'Clutch / Highlight',
        'Fail / Funny',
        'Challenge / Experiment',
        'News / Lore',
        'Review / Tier List'
    )),
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_seconds INTEGER NOT NULL DEFAULT 30,
    views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
    likes INTEGER CHECK (likes IS NULL OR likes >= 0),
    comments INTEGER CHECK (comments IS NULL OR comments >= 0),
    shares INTEGER CHECK (shares IS NULL OR shares >= 0),
    retention_rate_pct NUMERIC(5,2),
    url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Content Ideas Table
CREATE TABLE IF NOT EXISTS public.content_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    hook TEXT NOT NULL,
    script TEXT,
    caption TEXT,
    call_to_action TEXT,
    game TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram_reels', 'youtube_shorts')),
    content_format TEXT NOT NULL DEFAULT 'Clutch / Highlight',
    objective TEXT,
    hypothesis_to_test TEXT,
    status TEXT NOT NULL DEFAULT 'Idea' CHECK (status IN ('Idea', 'Scripting', 'Recorded', 'Published')),
    target_date DATE,
    actual_views INTEGER,
    actual_engagement_rate NUMERIC(5,2),
    actual_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Weekly Plans Table
CREATE TABLE IF NOT EXISTS public.weekly_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL DEFAULT CURRENT_DATE,
    plan_data JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_week UNIQUE (user_id, week_start)
);

-- 5. Coaching Reports Table
CREATE TABLE IF NOT EXISTS public.coaching_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model_used TEXT NOT NULL,
    summary TEXT NOT NULL,
    top_performing_formats JSONB NOT NULL DEFAULT '[]'::JSONB,
    underperforming_content JSONB NOT NULL DEFAULT '[]'::JSONB,
    recommendations JSONB NOT NULL DEFAULT '[]'::JSONB,
    experiments JSONB NOT NULL DEFAULT '[]'::JSONB,
    data_quality_notes TEXT,
    confidence TEXT DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Video Metrics Snapshots
CREATE TABLE IF NOT EXISTS public.video_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    views INTEGER NOT NULL,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Content Experiments Table
CREATE TABLE IF NOT EXISTS public.content_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 8. Auto-Profile Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    creator_name,
    display_name,
    handle,
    primary_game,
    main_games
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'creator_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'creator_name', split_part(NEW.email, '@', 1)),
    '@' || lower(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'creator_name', split_part(NEW.email, '@', 1)), '\s+', '', 'g')),
    'CODM',
    ARRAY['CODM', 'Valorant', 'Minecraft', 'BGMI']
  )
  ON CONFLICT (id) DO UPDATE SET
    creator_name = EXCLUDED.creator_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_videos_user_date ON public.videos(user_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_game ON public.videos(user_id, game);
CREATE INDEX IF NOT EXISTS idx_videos_platform ON public.videos(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_ideas_user_status ON public.content_ideas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_user ON public.weekly_plans(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON public.coaching_reports(user_id, created_at DESC);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_experiments ENABLE ROW LEVEL SECURITY;

-- 11. Security Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select own videos" ON public.videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own videos" ON public.videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own videos" ON public.videos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can select own content ideas" ON public.content_ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own content ideas" ON public.content_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content ideas" ON public.content_ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content ideas" ON public.content_ideas FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own weekly plans" ON public.weekly_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own coaching reports" ON public.coaching_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own video metrics" ON public.video_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own experiments" ON public.content_experiments FOR ALL USING (auth.uid() = user_id);
