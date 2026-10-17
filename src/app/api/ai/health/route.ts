import { NextRequest, NextResponse } from 'next/server';
import { checkOllamaHealth } from '@/lib/ai/ollama';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || undefined;

  const health = await checkOllamaHealth(endpoint);
  return NextResponse.json(health);
}
