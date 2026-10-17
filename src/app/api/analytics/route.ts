import { NextRequest, NextResponse } from 'next/server';
import { calculateAnalyticsSummary } from '@/lib/analytics/calculator';
import { SAMPLE_VIDEOS } from '@/lib/data/sample-gaming-data';
import { Video } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const videos: Video[] = body.videos || SAMPLE_VIDEOS;
    const summary = calculateAnalyticsSummary(videos);
    return NextResponse.json({ success: true, summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET() {
  const summary = calculateAnalyticsSummary(SAMPLE_VIDEOS);
  return NextResponse.json({ success: true, summary });
}
