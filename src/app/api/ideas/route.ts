import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const IdeaPayloadSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').optional(),
  working_title: z.string().optional(),
  hook: z.string().min(1, 'Hook is required'),
  script: z.string().optional().nullable(),
  content_outline: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  call_to_action: z.string().optional().nullable(),
  game: z.string().default('CODM'),
  platform: z.enum(['youtube_shorts', 'instagram_reels']).default('youtube_shorts'),
  content_format: z.string().default('Clutch / Highlight'),
  objective: z.string().optional().nullable(),
  hypothesis_to_test: z.string().optional().nullable(),
  status: z.enum(['Idea', 'Scripting', 'Recorded', 'Published']).default('Idea'),
  actual_views: z.union([z.coerce.number(), z.null()]).optional(),
  actual_engagement_rate: z.union([z.coerce.number(), z.null()]).optional(),
  actual_notes: z.string().optional().nullable(),
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

    const { data: ideas, error: dbError } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    // Map schema fields to ContentIdea client type
    const formatted = (ideas || []).map((i) => ({
      id: i.id,
      user_id: i.user_id,
      game: i.game,
      content_format: i.content_format,
      working_title: i.title,
      hook: i.hook,
      content_outline: i.script || i.content_outline || '',
      caption: i.caption,
      call_to_action: i.call_to_action,
      platform: i.platform,
      objective: i.objective || '',
      hypothesis_to_test: i.hypothesis_to_test || '',
      status: i.status,
      actual_views: i.actual_views,
      actual_engagement_rate: i.actual_engagement_rate,
      actual_notes: i.actual_notes,
      created_at: i.created_at,
    }));

    return NextResponse.json({ success: true, ideas: formatted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch ideas';
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
    const parsed = IdeaPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid idea data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const title = data.title || data.working_title || 'New Video Concept';

    const { data: created, error: insertError } = await supabase
      .from('content_ideas')
      .insert([
        {
          user_id: user.id,
          title,
          hook: data.hook,
          script: data.script || data.content_outline || null,
          content_outline: data.content_outline || data.script || null,
          caption: data.caption ?? null,
          call_to_action: data.call_to_action ?? null,
          game: data.game,
          platform: data.platform,
          content_format: data.content_format,
          objective: data.objective ?? null,
          hypothesis_to_test: data.hypothesis_to_test ?? null,
          status: data.status,
          actual_views: data.actual_views ?? null,
          actual_engagement_rate: data.actual_engagement_rate ?? null,
          actual_notes: data.actual_notes ?? null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      idea: {
        id: created.id,
        user_id: created.user_id,
        game: created.game,
        content_format: created.content_format,
        working_title: created.title,
        hook: created.hook,
        content_outline: created.script || created.content_outline || '',
        platform: created.platform,
        objective: created.objective || '',
        hypothesis_to_test: created.hypothesis_to_test || '',
        status: created.status,
        actual_views: created.actual_views,
        actual_engagement_rate: created.actual_engagement_rate,
        actual_notes: created.actual_notes,
        created_at: created.created_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create idea';
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
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Missing idea ID' }, { status: 400 });
    }

    const parsed = IdeaPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const title = data.title || data.working_title || 'Video Concept';

    const { data: updated, error: updateError } = await supabase
      .from('content_ideas')
      .update({
        title,
        hook: data.hook,
        script: data.script || data.content_outline || null,
        content_outline: data.content_outline || data.script || null,
        caption: data.caption ?? null,
        call_to_action: data.call_to_action ?? null,
        game: data.game,
        platform: data.platform,
        content_format: data.content_format,
        objective: data.objective ?? null,
        hypothesis_to_test: data.hypothesis_to_test ?? null,
        status: data.status,
        actual_views: data.actual_views ?? null,
        actual_engagement_rate: data.actual_engagement_rate ?? null,
        actual_notes: data.actual_notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      idea: {
        id: updated.id,
        user_id: updated.user_id,
        game: updated.game,
        content_format: updated.content_format,
        working_title: updated.title,
        hook: updated.hook,
        content_outline: updated.script || updated.content_outline || '',
        platform: updated.platform,
        objective: updated.objective || '',
        hypothesis_to_test: updated.hypothesis_to_test || '',
        status: updated.status,
        actual_views: updated.actual_views,
        actual_engagement_rate: updated.actual_engagement_rate,
        actual_notes: updated.actual_notes,
        created_at: updated.created_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update idea';
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
    const ideaId = searchParams.get('id');

    if (!ideaId) {
      return NextResponse.json({ success: false, error: 'Missing idea ID' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('content_ideas')
      .delete()
      .eq('id', ideaId)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: ideaId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete idea';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
