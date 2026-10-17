import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyPlanAI } from '@/lib/ai/ollama';
import { calculateAnalyticsSummary } from '@/lib/analytics/calculator';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SAMPLE_WEEKLY_PLAN } from '@/lib/data/sample-gaming-data';
import { Video, CreatorProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    let { profile, videos, endpoint, model, useDemoFallback, saveToDatabase = true } = body as {
      profile?: CreatorProfile;
      videos?: Video[];
      endpoint?: string;
      model?: string;
      useDemoFallback?: boolean;
      saveToDatabase?: boolean;
    };

    if (useDemoFallback) {
      return NextResponse.json({
        success: true,
        ideas: SAMPLE_WEEKLY_PLAN,
        isDemo: true,
      });
    }

    // If user is authenticated, fetch their actual videos from database if not supplied
    if (user && (!videos || videos.length === 0)) {
      const { data: dbVideos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('published_at', { ascending: false });

      if (dbVideos) {
        videos = dbVideos as Video[];
      }
    }

    // Fetch user profile if missing
    if (user && !profile) {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (dbProfile) {
        profile = {
          id: dbProfile.id,
          creator_name: dbProfile.creator_name,
          handle: dbProfile.handle,
          main_games: dbProfile.main_games,
          audience_type: dbProfile.audience_type,
          content_niche: dbProfile.content_niche,
          preferred_tone: dbProfile.preferred_tone,
          primary_platforms: dbProfile.primary_platforms,
          posting_frequency: dbProfile.posting_frequency,
          weekly_goals: {
            target_views: dbProfile.target_views,
            target_engagement: Number(dbProfile.target_engagement),
            target_posts: dbProfile.target_posts,
          },
          ai_model_config: {
            endpoint: dbProfile.ollama_endpoint,
            model: dbProfile.ollama_model,
            temperature: 0.7,
          },
        };
      }
    }

    const fallbackProfile: CreatorProfile = profile || {
      id: user?.id || 'guest',
      creator_name: user?.email?.split('@')[0] || 'Creator',
      handle: '@creator',
      main_games: ['CODM', 'Valorant'],
      audience_type: 'Competitive & Casual Gamers',
      content_niche: 'Clutch highlights & tips',
      preferred_tone: 'High-energy, tactical',
      primary_platforms: ['youtube_shorts', 'instagram_reels'],
      posting_frequency: '5 clips/week',
      weekly_goals: { target_views: 50000, target_engagement: 8, target_posts: 5 },
      ai_model_config: { endpoint: 'http://localhost:11434', model: 'llama3.2:latest', temperature: 0.7 },
    };

    const summary = calculateAnalyticsSummary(videos || []);
    const configuredEndpoint = endpoint || process.env.OLLAMA_BASE_URL || fallbackProfile.ai_model_config.endpoint;
    const configuredModel = model || process.env.OLLAMA_MODEL || fallbackProfile.ai_model_config.model;

    const result = await generateWeeklyPlanAI(fallbackProfile, summary, configuredEndpoint, configuredModel);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.code,
        },
        { status: 503 }
      );
    }

    const generatedIdeas = result.data!.ideas.map((item, idx) => ({
      id: `plan-${Date.now()}-${idx + 1}`,
      game: item.game,
      content_format: item.content_format,
      working_title: item.working_title,
      hook: item.hook,
      content_outline: item.content_outline,
      platform: item.platform,
      objective: item.objective,
      hypothesis_to_test: item.hypothesis_to_test,
      status: 'Idea' as const,
      created_at: new Date().toISOString(),
    }));

    // If user is authenticated, insert ideas into database
    if (user && saveToDatabase) {
      try {
        const rowsToInsert = generatedIdeas.map((i) => ({
          user_id: user.id,
          title: i.working_title,
          hook: i.hook,
          script: i.content_outline,
          content_outline: i.content_outline,
          game: i.game,
          platform: i.platform,
          content_format: i.content_format,
          objective: i.objective,
          hypothesis_to_test: i.hypothesis_to_test,
          status: 'Idea',
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('content_ideas')
          .insert(rowsToInsert)
          .select();

        if (!insertError && inserted) {
          const persisted = inserted.map((row) => ({
            id: row.id,
            user_id: row.user_id,
            game: row.game,
            content_format: row.content_format,
            working_title: row.title,
            hook: row.hook,
            content_outline: row.script || row.content_outline || '',
            platform: row.platform,
            objective: row.objective || '',
            hypothesis_to_test: row.hypothesis_to_test || '',
            status: row.status as 'Idea',
            created_at: row.created_at,
          }));
          return NextResponse.json({ success: true, ideas: persisted });
        }
      } catch (dbErr) {
        console.warn('Failed to persist ideas to database:', dbErr);
      }
    }

    return NextResponse.json({ success: true, ideas: generatedIdeas });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
