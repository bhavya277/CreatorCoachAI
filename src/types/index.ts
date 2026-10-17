export type Platform = 'instagram_reels' | 'youtube_shorts';

export type Game =
  | 'Minecraft'
  | 'Valorant'
  | 'CODM'
  | 'BGMI'
  | 'Apex Legends'
  | 'GTA V'
  | 'Other';

export type ContentFormat =
  | 'Tutorial / Guide'
  | 'Clutch / Highlight'
  | 'Fail / Funny'
  | 'Challenge / Experiment'
  | 'News / Lore'
  | 'Review / Tier List';

export type IdeaStatus = 'Idea' | 'Scripting' | 'Recorded' | 'Published';

export interface Video {
  id: string;
  user_id?: string;
  title: string;
  game: Game;
  platform: Platform;
  content_format: ContentFormat;
  published_at: string; // ISO date string YYYY-MM-DD
  duration_seconds: number;
  views: number;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  retention_rate_pct?: number | null; // e.g. 52.4%
  url?: string;
  notes?: string;
  created_at?: string;
}

export interface CreatorProfile {
  id: string;
  creator_name: string;
  handle: string;
  main_games: Game[];
  audience_type: string;
  content_niche: string;
  preferred_tone: string;
  primary_platforms: Platform[];
  posting_frequency: string;
  weekly_goals: {
    target_views: number;
    target_engagement: number;
    target_posts: number;
  };
  ai_model_config: {
    endpoint: string;
    model: string;
    temperature: number;
  };
}

export interface FormatPerformance {
  format: ContentFormat;
  count: number;
  total_views: number;
  avg_views: number;
  avg_engagement_rate: number | null;
  performance_index_vs_baseline: number; // e.g. 1.25 = +25% above baseline
}

export interface PlatformPerformance {
  platform: Platform;
  count: number;
  total_views: number;
  avg_views: number;
  avg_engagement_rate: number | null;
}

export interface GamePerformance {
  game: Game;
  count: number;
  total_views: number;
  avg_views: number;
  avg_engagement_rate: number | null;
}

export interface TrendDataPoint {
  date: string;
  title: string;
  game: Game;
  platform: Platform;
  views: number;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  engagement_rate: number | null;
}

export interface AnalyticsSummary {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_videos: number;
  avg_views: number;
  baseline_views: number;
  avg_engagement_rate: number | null; // calculated only with valid denominators
  videos_with_complete_engagement: number;
  videos_with_missing_metrics: number;
  format_performance: FormatPerformance[];
  platform_performance: PlatformPerformance[];
  game_performance: GamePerformance[];
  recent_trends: TrendDataPoint[];
  top_videos: Video[];
  underperforming_videos: Video[];
}

export interface CoachingReport {
  id: string;
  created_at: string;
  is_demo_report?: boolean;
  model_used?: string;
  summary: string;
  top_performing_formats: {
    format: string;
    observation: string;
    metric_evidence: string;
  }[];
  underperforming_content: {
    format: string;
    observation: string;
    potential_hypothesis: string;
  }[];
  recommendations: {
    id: number;
    title: string;
    action: string;
    evidence: string;
    confidence: 'High' | 'Medium' | 'Low';
    confidence_reason: string;
  }[];
  experiments: {
    id: number;
    title: string;
    game: Game;
    format: ContentFormat;
    platform: Platform;
    hypothesis: string;
    target_metric: string;
  }[];
  data_quality_notes: string;
}

export interface ScriptScene {
  scene_num: number;
  visual: string;
  audio_speech: string;
  duration_estimate: string;
}

export interface ScriptGeneration {
  id: string;
  created_at: string;
  game: Game;
  content_format: ContentFormat;
  platform: Platform;
  target_audience: string;
  tone: string;
  video_length: string;
  content_objective: string;
  hooks: {
    id: number;
    text: string;
    style: string;
  }[];
  script: string;
  scene_outline: ScriptScene[];
  on_screen_text: string[];
  caption: string;
  hashtags: string[];
  call_to_action: string;
  platform_adaptation: {
    platform: string;
    tips: string[];
  };
}

export interface ContentIdea {
  id: string;
  user_id?: string;
  game: Game;
  content_format: ContentFormat;
  working_title: string;
  hook: string;
  content_outline: string;
  platform: Platform;
  objective: string;
  hypothesis_to_test: string;
  status: IdeaStatus;
  target_date?: string;
  actual_views?: number | null;
  actual_engagement_rate?: number | null;
  actual_notes?: string;
  created_at: string;
}
