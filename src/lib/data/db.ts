'use client';

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Video, CreatorProfile, ContentIdea, CoachingReport } from '@/types';
import {
  SAMPLE_VIDEOS,
  SAMPLE_CREATOR_PROFILE,
  SAMPLE_WEEKLY_PLAN,
  SAMPLE_COACHING_REPORT,
} from './sample-gaming-data';

const STORAGE_KEYS = {
  VIDEOS: 'creatorcoach_videos_v2',
  PROFILE: 'creatorcoach_profile_v2',
  PLAN: 'creatorcoach_weekly_plan_v2',
  COACH_REPORT: 'creatorcoach_report_v2',
  DEMO_LOADED: 'creatorcoach_demo_loaded_v2',
};

function safeGetLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function safeSetLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const DataService = {
  // -------------------------------------------------------------
  // Videos Management
  // -------------------------------------------------------------
  async getVideos(): Promise<Video[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', user.id)
            .order('published_at', { ascending: false });

          if (!error && data) {
            return data as Video[];
          }
        }
      } catch (err) {
        console.warn('Could not query Supabase videos, falling back:', err);
      }
    }

    // Local storage fallback for guest/offline inspection
    return safeGetLocal<Video[]>(STORAGE_KEYS.VIDEOS, []);
  },

  async saveVideo(video: Video): Promise<Video> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // If ID looks like a client-generated UUID or timestamp, let Supabase handle or check existing
          const payload = {
            user_id: user.id,
            title: video.title,
            game: video.game,
            platform: video.platform,
            content_format: video.content_format,
            published_at: video.published_at,
            duration_seconds: video.duration_seconds || 30,
            views: video.views,
            likes: video.likes ?? null,
            comments: video.comments ?? null,
            shares: video.shares ?? null,
            retention_rate_pct: video.retention_rate_pct ?? null,
            url: video.url ?? null,
            notes: video.notes ?? null,
          };

          if (video.id && !video.id.startsWith('vid-') && !video.id.startsWith('imp-')) {
            const { data, error } = await supabase
              .from('videos')
              .update({ ...payload, updated_at: new Date().toISOString() })
              .eq('id', video.id)
              .eq('user_id', user.id)
              .select()
              .single();

            if (!error && data) return data as Video;
          } else {
            const { data, error } = await supabase
              .from('videos')
              .insert([payload])
              .select()
              .single();

            if (!error && data) return data as Video;
          }
        }
      } catch (err) {
        console.warn('Error saving video to Supabase:', err);
      }
    }

    // LocalStorage fallback
    const current = safeGetLocal<Video[]>(STORAGE_KEYS.VIDEOS, []);
    const idx = current.findIndex((v) => v.id === video.id);
    let updated: Video[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = video;
    } else {
      updated = [video, ...current];
    }
    safeSetLocal(STORAGE_KEYS.VIDEOS, updated);
    return video;
  },

  async deleteVideo(id: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (!error) return true;
        }
      } catch (err) {
        console.warn('Error deleting video from Supabase:', err);
      }
    }

    const current = safeGetLocal<Video[]>(STORAGE_KEYS.VIDEOS, []);
    const updated = current.filter((v) => v.id !== id);
    safeSetLocal(STORAGE_KEYS.VIDEOS, updated);
    return true;
  },

  async importVideos(newVideos: Video[]): Promise<Video[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const records = newVideos.map((v) => ({
            user_id: user.id,
            title: v.title,
            game: v.game,
            platform: v.platform,
            content_format: v.content_format,
            published_at: v.published_at,
            duration_seconds: v.duration_seconds || 30,
            views: v.views,
            likes: v.likes ?? null,
            comments: v.comments ?? null,
            shares: v.shares ?? null,
            retention_rate_pct: v.retention_rate_pct ?? null,
            notes: v.notes ?? null,
          }));

          const { data, error } = await supabase.from('videos').insert(records).select();
          if (!error && data) {
            return data as Video[];
          }
        }
      } catch (err) {
        console.warn('Error batch importing to Supabase:', err);
      }
    }

    const current = safeGetLocal<Video[]>(STORAGE_KEYS.VIDEOS, []);
    const existingIds = new Set(current.map((v) => v.id));
    const unique = newVideos.filter((v) => !existingIds.has(v.id));
    const updated = [...unique, ...current];
    safeSetLocal(STORAGE_KEYS.VIDEOS, updated);
    return updated;
  },

  // -------------------------------------------------------------
  // Weekly Planner & Content Ideas
  // -------------------------------------------------------------
  async getWeeklyPlan(): Promise<ContentIdea[]> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('content_ideas')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            return data.map((i) => ({
              id: i.id,
              user_id: i.user_id,
              game: i.game,
              content_format: i.content_format,
              working_title: i.title,
              hook: i.hook,
              content_outline: i.script || i.content_outline || '',
              platform: i.platform,
              objective: i.objective || '',
              hypothesis_to_test: i.hypothesis_to_test || '',
              status: i.status,
              actual_views: i.actual_views,
              actual_engagement_rate: i.actual_engagement_rate,
              actual_notes: i.actual_notes,
              created_at: i.created_at,
            }));
          }
        }
      } catch (err) {
        console.warn('Error querying content ideas from Supabase:', err);
      }
    }

    return safeGetLocal<ContentIdea[]>(STORAGE_KEYS.PLAN, []);
  },

  async saveContentIdea(idea: ContentIdea): Promise<ContentIdea> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const payload = {
            user_id: user.id,
            title: idea.working_title,
            hook: idea.hook,
            script: idea.content_outline,
            content_outline: idea.content_outline,
            game: idea.game,
            platform: idea.platform,
            content_format: idea.content_format,
            objective: idea.objective || null,
            hypothesis_to_test: idea.hypothesis_to_test || null,
            status: idea.status,
            actual_views: idea.actual_views ?? null,
            actual_engagement_rate: idea.actual_engagement_rate ?? null,
            actual_notes: idea.actual_notes ?? null,
          };

          if (idea.id && !idea.id.startsWith('plan-')) {
            const { data, error } = await supabase
              .from('content_ideas')
              .update({ ...payload, updated_at: new Date().toISOString() })
              .eq('id', idea.id)
              .eq('user_id', user.id)
              .select()
              .single();

            if (!error && data) {
              return {
                ...idea,
                id: data.id,
              };
            }
          } else {
            const { data, error } = await supabase
              .from('content_ideas')
              .insert([payload])
              .select()
              .single();

            if (!error && data) {
              return {
                ...idea,
                id: data.id,
              };
            }
          }
        }
      } catch (err) {
        console.warn('Error saving idea to Supabase:', err);
      }
    }

    const current = safeGetLocal<ContentIdea[]>(STORAGE_KEYS.PLAN, []);
    const idx = current.findIndex((i) => i.id === idea.id);
    let updated: ContentIdea[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = idea;
    } else {
      updated = [idea, ...current];
    }
    safeSetLocal(STORAGE_KEYS.PLAN, updated);
    return idea;
  },

  async deleteContentIdea(id: string): Promise<boolean> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error } = await supabase
            .from('content_ideas')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (!error) return true;
        }
      } catch (err) {
        console.warn('Error deleting idea from Supabase:', err);
      }
    }

    const current = safeGetLocal<ContentIdea[]>(STORAGE_KEYS.PLAN, []);
    const updated = current.filter((i) => i.id !== id);
    safeSetLocal(STORAGE_KEYS.PLAN, updated);
    return true;
  },

  // -------------------------------------------------------------
  // Creator Profile
  // -------------------------------------------------------------
  async getProfile(): Promise<CreatorProfile> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            return {
              id: data.id,
              creator_name: data.creator_name || 'Creator',
              handle: data.handle || '@creator',
              main_games: data.main_games || ['CODM', 'Valorant'],
              audience_type: data.audience_type || 'Competitive & Casual Gamers',
              content_niche: data.content_niche || 'Clutch plays & game mechanics guides',
              preferred_tone: data.preferred_tone || 'High-energy, tactical, and entertaining',
              primary_platforms: data.primary_platforms || ['youtube_shorts', 'instagram_reels'],
              posting_frequency: data.posting_frequency || '5 videos / week',
              weekly_goals: {
                target_views: data.target_views || 50000,
                target_engagement: Number(data.target_engagement) || 8.0,
                target_posts: data.target_posts || 5,
              },
              ai_model_config: {
                endpoint: data.ollama_endpoint || 'http://localhost:11434',
                model: data.ollama_model || 'llama3.2:latest',
                temperature: 0.7,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Error getting profile from Supabase:', err);
      }
    }

    return safeGetLocal<CreatorProfile>(STORAGE_KEYS.PROFILE, SAMPLE_CREATOR_PROFILE);
  },

  async saveProfile(profile: CreatorProfile): Promise<CreatorProfile> {
    if (supabase && isSupabaseConfigured) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            creator_name: profile.creator_name,
            handle: profile.handle,
            main_games: profile.main_games,
            audience_type: profile.audience_type,
            content_niche: profile.content_niche,
            preferred_tone: profile.preferred_tone,
            primary_platforms: profile.primary_platforms,
            posting_frequency: profile.posting_frequency,
            target_views: profile.weekly_goals.target_views,
            target_engagement: profile.weekly_goals.target_engagement,
            target_posts: profile.weekly_goals.target_posts,
            ollama_endpoint: profile.ai_model_config.endpoint,
            ollama_model: profile.ai_model_config.model,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Error saving profile to Supabase:', err);
      }
    }

    safeSetLocal(STORAGE_KEYS.PROFILE, profile);
    return profile;
  },

  // -------------------------------------------------------------
  // Explicit Demo Data Seeding (only when user opts in)
  // -------------------------------------------------------------
  async loadSampleDataIntoAccount(): Promise<{ videos: Video[]; ideas: ContentIdea[] }> {
    const importedVideos: Video[] = [];
    for (const sample of SAMPLE_VIDEOS) {
      const saved = await this.saveVideo({
        ...sample,
        id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });
      importedVideos.push(saved);
    }

    const importedIdeas: ContentIdea[] = [];
    for (const plan of SAMPLE_WEEKLY_PLAN) {
      const saved = await this.saveContentIdea({
        ...plan,
        id: `sample-plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });
      importedIdeas.push(saved);
    }

    return { videos: importedVideos, ideas: importedIdeas };
  },

  resetLocalStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.VIDEOS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.COACH_REPORT);
  },
};

// Backwards-compatible DataStore proxy that delegates to DataService and emits events
export const DataStore = {
  getVideos(): Video[] {
    return safeGetLocal<Video[]>(STORAGE_KEYS.VIDEOS, []);
  },

  saveVideo(video: Video): Video[] {
    DataService.saveVideo(video);
    const current = safeGetLocal<Video[]>(STORAGE_KEYS.VIDEOS, []);
    const idx = current.findIndex((v) => v.id === video.id);
    let updated: Video[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = video;
    } else {
      updated = [video, ...current];
    }
    safeSetLocal(STORAGE_KEYS.VIDEOS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('creatorcoach_video_saved', { detail: updated }));
    }
    return updated;
  },

  deleteVideo(id: string): Video[] {
    DataService.deleteVideo(id);
    const current = safeGetLocal<Video[]>(STORAGE_KEYS.VIDEOS, []);
    const updated = current.filter((v) => v.id !== id);
    safeSetLocal(STORAGE_KEYS.VIDEOS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('creatorcoach_video_saved', { detail: updated }));
    }
    return updated;
  },

  importVideos(newVideos: Video[]): Video[] {
    DataService.importVideos(newVideos);
    const current = safeGetLocal<Video[]>(STORAGE_KEYS.VIDEOS, []);
    const existingIds = new Set(current.map((v) => v.id));
    const unique = newVideos.filter((v) => !existingIds.has(v.id));
    const updated = [...unique, ...current];
    safeSetLocal(STORAGE_KEYS.VIDEOS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('creatorcoach_video_saved', { detail: updated }));
    }
    return updated;
  },

  getProfile(): CreatorProfile {
    return safeGetLocal<CreatorProfile>(STORAGE_KEYS.PROFILE, SAMPLE_CREATOR_PROFILE);
  },

  saveProfile(profile: CreatorProfile): CreatorProfile {
    DataService.saveProfile(profile);
    safeSetLocal(STORAGE_KEYS.PROFILE, profile);
    return profile;
  },

  getWeeklyPlan(): ContentIdea[] {
    return safeGetLocal<ContentIdea[]>(STORAGE_KEYS.PLAN, []);
  },

  saveWeeklyPlan(ideas: ContentIdea[]): ContentIdea[] {
    safeSetLocal(STORAGE_KEYS.PLAN, ideas);
    return ideas;
  },

  saveContentIdea(idea: ContentIdea): ContentIdea[] {
    DataService.saveContentIdea(idea);
    const current = safeGetLocal<ContentIdea[]>(STORAGE_KEYS.PLAN, []);
    const idx = current.findIndex((i) => i.id === idea.id);
    let updated: ContentIdea[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = idea;
    } else {
      updated = [idea, ...current];
    }
    safeSetLocal(STORAGE_KEYS.PLAN, updated);
    return updated;
  },

  deleteContentIdea(id: string): ContentIdea[] {
    DataService.deleteContentIdea(id);
    const current = safeGetLocal<ContentIdea[]>(STORAGE_KEYS.PLAN, []);
    const updated = current.filter((i) => i.id !== id);
    safeSetLocal(STORAGE_KEYS.PLAN, updated);
    return updated;
  },

  getLatestReport(): CoachingReport | null {
    return safeGetLocal<CoachingReport | null>(STORAGE_KEYS.COACH_REPORT, null);
  },

  saveCoachingReport(report: CoachingReport): void {
    safeSetLocal(STORAGE_KEYS.COACH_REPORT, report);
  },

  resetToDemoData(): void {
    safeSetLocal(STORAGE_KEYS.VIDEOS, SAMPLE_VIDEOS);
    safeSetLocal(STORAGE_KEYS.PROFILE, SAMPLE_CREATOR_PROFILE);
    safeSetLocal(STORAGE_KEYS.PLAN, SAMPLE_WEEKLY_PLAN);
    safeSetLocal(STORAGE_KEYS.COACH_REPORT, SAMPLE_COACHING_REPORT);
  },
};
