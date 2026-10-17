import { NextRequest, NextResponse } from 'next/server';
import { generateCoachingReportAI } from '@/lib/ai/ollama';
import { calculateAnalyticsSummary } from '@/lib/analytics/calculator';
import { SAMPLE_COACHING_REPORT } from '@/lib/data/sample-gaming-data';
import { Video, CreatorProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      videos,
      profile,
      endpoint,
      model,
      useDemoReport,
    } = body as {
      videos: Video[];
      profile: CreatorProfile;
      endpoint?: string;
      model?: string;
      useDemoReport?: boolean;
    };

    if (useDemoReport) {
      return NextResponse.json({
        success: true,
        report: SAMPLE_COACHING_REPORT,
        isDemo: true,
      });
    }

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one video is required to generate a coaching report.' },
        { status: 400 }
      );
    }

    // Deterministically compute the analytics summary from raw videos
    const summary = calculateAnalyticsSummary(videos);

    // Call Ollama open-weight inference
    const result = await generateCoachingReportAI(summary, profile, endpoint, model);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.code,
          endpoint: endpoint || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
          model: model || process.env.OLLAMA_MODEL || 'llama3.2:latest',
        },
        { status: 503 }
      );
    }

    const report = {
      id: `rep-${Date.now()}`,
      created_at: new Date().toISOString(),
      model_used: `${model || 'llama3.2'} (Ollama)`,
      ...result.data!,
    };

    return NextResponse.json({ success: true, report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
