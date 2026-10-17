import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { Game, Platform, ContentFormat } from '@/types';

const VideoImportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  game: z.string().transform((val): Game => {
    const lower = val.toLowerCase();
    if (lower.includes('minecraft')) return 'Minecraft';
    if (lower.includes('valorant')) return 'Valorant';
    if (lower.includes('bgmi') || lower.includes('battlegrounds') || lower.includes('pubg')) return 'BGMI';
    if (lower.includes('codm') || lower.includes('call of duty') || lower.includes('cod')) return 'CODM';
    if (lower.includes('apex')) return 'Apex Legends';
    if (lower.includes('gta')) return 'GTA V';
    return 'Other';
  }),
  platform: z.string().transform((val): Platform => {
    const lower = val.toLowerCase();
    if (lower.includes('youtube') || lower.includes('short')) return 'youtube_shorts';
    return 'instagram_reels';
  }),
  content_format: z.string().transform((val): ContentFormat => {
    const lower = val.toLowerCase();
    if (lower.includes('tutorial') || lower.includes('guide') || lower.includes('tip')) return 'Tutorial / Guide';
    if (lower.includes('clutch') || lower.includes('highlight') || lower.includes('montage')) return 'Clutch / Highlight';
    if (lower.includes('fail') || lower.includes('funny') || lower.includes('meme')) return 'Fail / Funny';
    if (lower.includes('challenge') || lower.includes('experiment')) return 'Challenge / Experiment';
    if (lower.includes('news') || lower.includes('lore') || lower.includes('update')) return 'News / Lore';
    if (lower.includes('review') || lower.includes('tier') || lower.includes('rank')) return 'Review / Tier List';
    return 'Clutch / Highlight';
  }),
  published_at: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
  duration_seconds: z.coerce.number().min(1).default(30),
  views: z.coerce.number().min(0).default(0),
  likes: z.union([z.coerce.number().min(0), z.null(), z.literal('')]).transform((v) => (v === '' || v === null ? null : Number(v))),
  comments: z.union([z.coerce.number().min(0), z.null(), z.literal('')]).transform((v) => (v === '' || v === null ? null : Number(v))),
  shares: z.union([z.coerce.number().min(0), z.null(), z.literal('')]).transform((v) => (v === '' || v === null ? null : Number(v))),
  retention_rate_pct: z.union([z.coerce.number().min(0).max(100), z.null(), z.literal('')]).optional().transform((v) => (v === '' || v === null || v === undefined ? null : Number(v))),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows } = body as { rows: unknown[] };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data rows provided for import.' },
        { status: 400 }
      );
    }

    const validatedVideos = [];
    const errors: { row: number; errors: string[] }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const parsed = VideoImportSchema.safeParse(rawRow);
      if (parsed.success) {
        validatedVideos.push({
          ...parsed.data,
        });
      } else {
        errors.push({
          row: i + 1,
          errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        });
      }
    }

    if (validatedVideos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid video rows could be parsed.',
          failedCount: errors.length,
          errors: errors.slice(0, 10),
        },
        { status: 400 }
      );
    }

    // Check if user is authenticated with Supabase to persist directly
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let persistedVideos = [];

    if (user) {
      const recordsToInsert = validatedVideos.map((v) => ({
        user_id: user.id,
        title: v.title,
        game: v.game,
        platform: v.platform,
        content_format: v.content_format,
        published_at: v.published_at,
        duration_seconds: v.duration_seconds,
        views: v.views,
        likes: v.likes,
        comments: v.comments,
        shares: v.shares,
        retention_rate_pct: v.retention_rate_pct,
        notes: v.notes,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('videos')
        .insert(recordsToInsert)
        .select();

      if (insertError) {
        console.error('Supabase batch import error:', insertError);
      } else {
        persistedVideos = inserted || [];
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: validatedVideos.length,
      failedCount: errors.length,
      videos: persistedVideos.length > 0 ? persistedVideos : validatedVideos.map((v, i) => ({ id: `imp-${Date.now()}-${i + 1}`, ...v })),
      errors: errors.slice(0, 10),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
