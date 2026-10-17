import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyPlanAI } from '@/lib/ai/ollama';
import { calculateAnalyticsSummary } from '@/lib/analytics/calculator';
import { SAMPLE_WEEKLY_PLAN } from '@/lib/data/sample-gaming-data';
import { Video, CreatorProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, videos, endpoint, model, useDemoFallback } = body as {
      profile: CreatorProfile;
      videos: Video[];
      endpoint?: string;
      model?: string;
      useDemoFallback?: boolean;
    };

    if (useDemoFallback) {
      return NextResponse.json({
        success: true,
        ideas: SAMPLE_WEEKLY_PLAN,
        isDemo: true,
      });
    }

    const summary = calculateAnalyticsSummary(videos || []);
    const result = await generateWeeklyPlanAI(profile, summary, endpoint, model);

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

    const ideas = result.data!.ideas.map((item, idx) => ({
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

    return NextResponse.json({ success: true, ideas });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
