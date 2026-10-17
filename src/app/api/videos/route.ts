import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const VideoPayloadSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  game: z.enum(['Minecraft', 'Valorant', 'CODM', 'BGMI', 'Apex Legends', 'GTA V', 'Other']),
  platform: z.enum(['youtube_shorts', 'instagram_reels']),
  content_format: z.enum([
    'Tutorial / Guide',
    'Clutch / Highlight',
    'Fail / Funny',
    'Challenge / Experiment',
    'News / Lore',
    'Review / Tier List',
  ]),
  published_at: z.string().min(1, 'Publication date is required'),
  duration_seconds: z.coerce.number().min(1).default(30),
  views: z.coerce.number().min(0).default(0),
  likes: z.union([z.coerce.number().min(0), z.null()]).optional(),
  comments: z.union([z.coerce.number().min(0), z.null()]).optional(),
  shares: z.union([z.coerce.number().min(0), z.null()]).optional(),
  retention_rate_pct: z.union([z.coerce.number().min(0).max(100), z.null()]).optional(),
  url: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: videos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('published_at', { ascending: false });

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, videos: videos || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch videos';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const parsed = VideoPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid video data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const videoData = parsed.data;

    const { data: created, error: insertError } = await supabase
      .from('videos')
      .insert([
        {
          user_id: user.id,
          title: videoData.title,
          game: videoData.game,
          platform: videoData.platform,
          content_format: videoData.content_format,
          published_at: videoData.published_at,
          duration_seconds: videoData.duration_seconds,
          views: videoData.views,
          likes: videoData.likes ?? null,
          comments: videoData.comments ?? null,
          shares: videoData.shares ?? null,
          retention_rate_pct: videoData.retention_rate_pct ?? null,
          url: videoData.url ?? null,
          notes: videoData.notes ?? null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, video: created });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create video';
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
    const parsed = VideoPayloadSchema.safeParse(body);

    if (!parsed.success || !body.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid video ID or payload' },
        { status: 400 }
      );
    }

    const videoData = parsed.data;

    const { data: updated, error: updateError } = await supabase
      .from('videos')
      .update({
        title: videoData.title,
        game: videoData.game,
        platform: videoData.platform,
        content_format: videoData.content_format,
        published_at: videoData.published_at,
        duration_seconds: videoData.duration_seconds,
        views: videoData.views,
        likes: videoData.likes ?? null,
        comments: videoData.comments ?? null,
        shares: videoData.shares ?? null,
        retention_rate_pct: videoData.retention_rate_pct ?? null,
        url: videoData.url ?? null,
        notes: videoData.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, video: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update video';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json({ success: false, error: 'Missing video ID parameter' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: videoId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete video';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
