'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { CreatorProfile } from '@/types';
import { SAMPLE_CREATOR_PROFILE } from '@/lib/data/sample-gaming-data';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: CreatorProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, creatorName: string) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<CreatorProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or create profile in Supabase public.profiles
  const fetchProfile = async (currentUser: User) => {
    if (!supabase || !isSupabaseConfigured) {
      setProfile(SAMPLE_CREATOR_PROFILE);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching creator profile:', error);
      }

      if (data) {
        setProfile({
          id: data.id,
          creator_name: data.creator_name || data.display_name || currentUser.user_metadata?.creator_name || 'Creator',
          handle: data.handle || `@${(data.creator_name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
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
        });
      } else {
        // Initial profile creation for new user
        const newProfile: CreatorProfile = {
          id: currentUser.id,
          creator_name: currentUser.user_metadata?.creator_name || currentUser.email?.split('@')[0] || 'Creator',
          handle: `@${(currentUser.user_metadata?.creator_name || currentUser.email?.split('@')[0] || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          main_games: ['CODM', 'Valorant'],
          audience_type: 'Competitive & Casual Gamers',
          content_niche: 'Clutch plays & game mechanics guides',
          preferred_tone: 'High-energy, tactical, and entertaining',
          primary_platforms: ['youtube_shorts', 'instagram_reels'],
          posting_frequency: '5 videos / week',
          weekly_goals: {
            target_views: 50000,
            target_engagement: 8.0,
            target_posts: 5,
          },
          ai_model_config: {
            endpoint: 'http://localhost:11434',
            model: 'llama3.2:latest',
            temperature: 0.7,
          },
        };

        const { error: insertError } = await supabase.from('profiles').insert([
          {
            id: currentUser.id,
            creator_name: newProfile.creator_name,
            handle: newProfile.handle,
            main_games: newProfile.main_games,
            audience_type: newProfile.audience_type,
            content_niche: newProfile.content_niche,
            preferred_tone: newProfile.preferred_tone,
            primary_platforms: newProfile.primary_platforms,
            posting_frequency: newProfile.posting_frequency,
            target_views: newProfile.weekly_goals.target_views,
            target_engagement: newProfile.weekly_goals.target_engagement,
            target_posts: newProfile.weekly_goals.target_posts,
            ollama_endpoint: newProfile.ai_model_config.endpoint,
            ollama_model: newProfile.ai_model_config.model,
          },
        ]);

        if (insertError) {
          console.warn('Could not auto-insert profile into database:', insertError.message);
        }
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Profile fetch exception:', err);
      setProfile(SAMPLE_CREATOR_PROFILE);
    }
  };

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen to Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase || !isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured yet. Check NEXT_PUBLIC_SUPABASE_URL and ANON key.') };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, creatorName: string) => {
    if (!supabase || !isSupabaseConfigured) {
      return {
        error: new Error('Supabase is not configured yet. Check NEXT_PUBLIC_SUPABASE_URL and ANON key.'),
        user: null,
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          creator_name: creatorName,
        },
      },
    });

    if (data.user) {
      await fetchProfile(data.user);
    }

    return { error: error ? new Error(error.message) : null, user: data.user };
  };

  const signOut = async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!supabase || !isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const updatePassword = async (password: string) => {
    if (!supabase || !isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured.') };
    }
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const updateProfile = async (updates: Partial<CreatorProfile>) => {
    if (!user || !profile) {
      return { error: new Error('No authenticated user') };
    }

    const merged = { ...profile, ...updates };
    setProfile(merged);

    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          creator_name: merged.creator_name,
          handle: merged.handle,
          main_games: merged.main_games,
          audience_type: merged.audience_type,
          content_niche: merged.content_niche,
          preferred_tone: merged.preferred_tone,
          primary_platforms: merged.primary_platforms,
          posting_frequency: merged.posting_frequency,
          target_views: merged.weekly_goals.target_views,
          target_engagement: merged.weekly_goals.target_engagement,
          target_posts: merged.weekly_goals.target_posts,
          ollama_endpoint: merged.ai_model_config.endpoint,
          ollama_model: merged.ai_model_config.model,
          updated_at: new Date().toISOString(),
        });

      return { error: error ? new Error(error.message) : null };
    }

    return { error: null };
  };

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
      updateProfile,
    }),
    [user, session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
