'use client';

import { Video, CreatorProfile, ContentIdea, CoachingReport } from '@/types';
import {
  SAMPLE_VIDEOS,
  SAMPLE_CREATOR_PROFILE,
  SAMPLE_WEEKLY_PLAN,
  SAMPLE_COACHING_REPORT,
} from './sample-gaming-data';

const STORAGE_KEYS = {
  VIDEOS: 'creatorcoach_videos_v1',
  PROFILE: 'creatorcoach_profile_v1',
  PLAN: 'creatorcoach_weekly_plan_v1',
  COACH_REPORT: 'creatorcoach_report_v1',
  IS_DEMO: 'creatorcoach_is_demo_v1',
};

function safeGetItem<T>(key: string, defaultValue: T): T {
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

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const DataStore = {
  // Videos
  getVideos(): Video[] {
    return safeGetItem<Video[]>(STORAGE_KEYS.VIDEOS, SAMPLE_VIDEOS);
  },

  saveVideo(video: Video): Video[] {
    const current = this.getVideos();
    const index = current.findIndex((v) => v.id === video.id);
    let updated: Video[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = video;
    } else {
      updated = [video, ...current];
    }
    safeSetItem(STORAGE_KEYS.VIDEOS, updated);
    return updated;
  },

  deleteVideo(id: string): Video[] {
    const current = this.getVideos();
    const updated = current.filter((v) => v.id !== id);
    safeSetItem(STORAGE_KEYS.VIDEOS, updated);
    return updated;
  },

  importVideos(newVideos: Video[]): Video[] {
    const current = this.getVideos();
    // Prepend newly imported videos while avoiding duplicate IDs
    const existingIds = new Set(current.map((v) => v.id));
    const uniqueNew = newVideos.filter((v) => !existingIds.has(v.id));
    const updated = [...uniqueNew, ...current];
    safeSetItem(STORAGE_KEYS.VIDEOS, updated);
    return updated;
  },

  // Creator Profile
  getProfile(): CreatorProfile {
    return safeGetItem<CreatorProfile>(STORAGE_KEYS.PROFILE, SAMPLE_CREATOR_PROFILE);
  },

  saveProfile(profile: CreatorProfile): CreatorProfile {
    safeSetItem(STORAGE_KEYS.PROFILE, profile);
    return profile;
  },

  // Weekly Planner
  getWeeklyPlan(): ContentIdea[] {
    return safeGetItem<ContentIdea[]>(STORAGE_KEYS.PLAN, SAMPLE_WEEKLY_PLAN);
  },

  saveWeeklyPlan(ideas: ContentIdea[]): ContentIdea[] {
    safeSetItem(STORAGE_KEYS.PLAN, ideas);
    return ideas;
  },

  saveContentIdea(idea: ContentIdea): ContentIdea[] {
    const current = this.getWeeklyPlan();
    const index = current.findIndex((i) => i.id === idea.id);
    let updated: ContentIdea[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = idea;
    } else {
      updated = [idea, ...current];
    }
    safeSetItem(STORAGE_KEYS.PLAN, updated);
    return updated;
  },

  deleteContentIdea(id: string): ContentIdea[] {
    const current = this.getWeeklyPlan();
    const updated = current.filter((i) => i.id !== id);
    safeSetItem(STORAGE_KEYS.PLAN, updated);
    return updated;
  },

  // Coaching Reports
  getLatestReport(): CoachingReport | null {
    return safeGetItem<CoachingReport | null>(STORAGE_KEYS.COACH_REPORT, SAMPLE_COACHING_REPORT);
  },

  saveCoachingReport(report: CoachingReport): void {
    safeSetItem(STORAGE_KEYS.COACH_REPORT, report);
  },

  // Reset to Demo
  resetToDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.VIDEOS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.COACH_REPORT);
    safeSetItem(STORAGE_KEYS.VIDEOS, SAMPLE_VIDEOS);
    safeSetItem(STORAGE_KEYS.PROFILE, SAMPLE_CREATOR_PROFILE);
    safeSetItem(STORAGE_KEYS.PLAN, SAMPLE_WEEKLY_PLAN);
    safeSetItem(STORAGE_KEYS.COACH_REPORT, SAMPLE_COACHING_REPORT);
  },
};
