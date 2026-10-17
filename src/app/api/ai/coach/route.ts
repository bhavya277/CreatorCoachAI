import { NextRequest, NextResponse } from 'next/server';
import { generateCoachingReportAI } from '@/lib/ai/ollama';
import { calculateAnalyticsSummary } from '@/lib/analytics/calculator';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SAMPLE_COACHING_REPORT } from '@/lib/data/sample-gaming-data';
import { Video, CreatorProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    let {
      videos,
      profile,
      endpoint,
      model,
      useDemoReport,
      saveToDatabase = true,
    } = body as {
      videos?: Video[];
      profile?: CreatorProfile;
      endpoint?: string;
      model?: string;
      useDemoReport?: boolean;
      saveToDatabase?: boolean;
    };

    if (useDemoReport) {
      return NextResponse.json({
        success: true,
        report: SAMPLE_COACHING_REPORT,
        isDemo: true,
      });
    }

    // If user is authenticated and videos were not sent or empty, query their database videos directly
    if (user && (!videos || videos.length === 0)) {
      const { data: dbVideos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('published_at', { ascending: false });

      if (dbVideos && dbVideos.length > 0) {
        videos = dbVideos as Video[];
      }
    }

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No videos found in your catalog. Add your clips or import a CSV to generate personalized AI coaching.',
          code: 'NO_VIDEOS',
        },
        { status: 400 }
      );
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

    // Deterministically compute the analytics summary from raw videos
    const summary = calculateAnalyticsSummary(videos);

    const configuredEndpoint = endpoint || process.env.OLLAMA_BASE_URL || fallbackProfile.ai_model_config.endpoint;
    const configuredModel = model || process.env.OLLAMA_MODEL || fallbackProfile.ai_model_config.model;

    // Call Ollama open-weight inference
    const result = await generateCoachingReportAI(summary, fallbackProfile, configuredEndpoint, configuredModel);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.code,
          endpoint: configuredEndpoint,
          model: configuredModel,
        },
        { status: 503 }
      );
    }

    const reportId = `rep-${Date.now()}`;
    const reportData = {
      id: reportId,
      created_at: new Date().toISOString(),
      model_used: `${configuredModel} (Ollama)`,
      ...result.data!,
    };

    // If authenticated, persist the coaching report to Supabase
    if (user && saveToDatabase) {
      try {
        await supabase.from('coaching_reports').insert([
          {
            user_id: user.id,
            model_used: reportData.model_used,
            summary: reportData.summary,
            top_performing_formats: reportData.top_performing_formats,
            underperforming_content: reportData.underperforming_content,
            recommendations: reportData.recommendations,
            experiments: reportData.experiments,
            data_quality_notes: reportData.data_quality_notes,
            confidence: 'Medium',
          },
        ]);
      } catch (saveErr) {
        console.warn('Could not persist report to database:', saveErr);
      }
    }

    return NextResponse.json({ success: true, report: reportData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
