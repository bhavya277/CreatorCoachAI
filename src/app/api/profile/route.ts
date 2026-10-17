import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ProfileUpdateSchema = z.object({
  creator_name: z.string().min(1, 'Name is required'),
  handle: z.string().min(1, 'Handle is required'),
  main_games: z.array(z.string()).default(['CODM', 'Valorant']),
  audience_type: z.string().default('Competitive & Casual Gamers'),
  content_niche: z.string().default('Clutch plays & game mechanics guides'),
  preferred_tone: z.string().default('High-energy, tactical, and entertaining'),
  primary_platforms: z.array(z.string()).default(['youtube_shorts', 'instagram_reels']),
  posting_frequency: z.string().default('5 videos / week'),
  weekly_goals: z.object({
    target_views: z.coerce.number().default(50000),
    target_engagement: z.coerce.number().default(8.0),
    target_posts: z.coerce.number().default(5),
  }),
  ai_model_config: z.object({
    endpoint: z.string().default('http://localhost:11434'),
    model: z.string().default('llama3.2:latest'),
    temperature: z.number().default(0.7),
  }),
});

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        creator_name: profile.creator_name,
        handle: profile.handle,
        main_games: profile.main_games,
        audience_type: profile.audience_type,
        content_niche: profile.content_niche,
        preferred_tone: profile.preferred_tone,
        primary_platforms: profile.primary_platforms,
        posting_frequency: profile.posting_frequency,
        weekly_goals: {
          target_views: profile.target_views,
          target_engagement: Number(profile.target_engagement),
          target_posts: profile.target_posts,
        },
        ai_model_config: {
          endpoint: profile.ollama_endpoint,
          model: profile.ollama_model,
          temperature: 0.7,
        },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch profile';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid profile data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const { data: updated, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        creator_name: d.creator_name,
        handle: d.handle,
        main_games: d.main_games,
        audience_type: d.audience_type,
        content_niche: d.content_niche,
        preferred_tone: d.preferred_tone,
        primary_platforms: d.primary_platforms,
        posting_frequency: d.posting_frequency,
        target_views: d.weekly_goals.target_views,
        target_engagement: d.weekly_goals.target_engagement,
        target_posts: d.weekly_goals.target_posts,
        ollama_endpoint: d.ai_model_config.endpoint,
        ollama_model: d.ai_model_config.model,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (upsertError) {
      return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update profile';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
