import { NextRequest, NextResponse } from 'next/server';
import { generateContentScriptAI } from '@/lib/ai/ollama';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      game,
      content_format,
      platform,
      target_audience,
      tone,
      video_length,
      content_objective,
      endpoint,
      model,
      useDemoFallback,
    } = body;

    if (!game || !content_format || !platform) {
      return NextResponse.json(
        { success: false, error: 'Game, format, and platform are required.' },
        { status: 400 }
      );
    }

    if (useDemoFallback) {
      // Provide a tailored demonstration script for testing without Ollama
      return NextResponse.json({
        success: true,
        data: {
          id: `script-${Date.now()}`,
          created_at: new Date().toISOString(),
          game,
          content_format,
          platform,
          target_audience: target_audience || 'Gaming community',
          tone: tone || 'High-energy & Tactical',
          video_length: video_length || '30-45s',
          content_objective: content_objective || 'High retention & shares',
          hooks: [
            {
              id: 1,
              text: `Stop scrolling! This 3-second ${game} trick is banned in most tournaments for a reason.`,
              style: 'High Shock / Urgency',
            },
            {
              id: 2,
              text: `99% of ${game} players make this exact mistake when clutching rounds...`,
              style: 'Curiosity Gap / Ego Hook',
            },
            {
              id: 3,
              text: `Watch what happens when you combine this weapon setup with instant animation cancel in ${game}.`,
              style: 'Action Climax / Visual Tease',
            },
          ],
          script: `[00:00-00:03] Stop scrolling! This secret ${game} trick will win your next 5 ranked games. [00:03-00:12] Look right here at this corner. Instead of standard peeking, hold sprint and cancel your slide simultaneously. [00:12-00:24] Notice how your crosshair stays locked at head level with zero recoil bloom. Test this in firing range today! [00:24-00:35] Hit save so you remember this lineup before your next ranked session.`,
          scene_outline: [
            {
              scene_num: 1,
              visual: `Fast-motion cut into ${game} clutch climax with flashing border warning`,
              audio_speech: 'Stop scrolling! This secret trick will win your next 5 games.',
              duration_estimate: '0-3s',
            },
            {
              scene_num: 2,
              visual: 'Zoom-in on keybind inputs & crosshair placement',
              audio_speech: 'Instead of standard peeking, hold sprint and cancel your slide simultaneously.',
              duration_estimate: '3-15s',
            },
            {
              scene_num: 3,
              visual: 'Enemy POV split screen showing zero reaction time',
              audio_speech: 'Look at how impossible this angle is to counter from their screen.',
              duration_estimate: '15-28s',
            },
            {
              scene_num: 4,
              visual: 'Quick bookmark graphic animation and follow prompt',
              audio_speech: 'Hit save and share with your duo partner right now!',
              duration_estimate: '28-35s',
            },
          ],
          on_screen_text: [
            'HOLD SPRINT + CANCEL SLIDE',
            'ZERO RECOIL GLITCH?',
            'SAVE FOR RANKED',
          ],
          caption: `Secret ${game} mechanic that pros don't want you to know 🔥 Save this before it gets patched!\n\nTag your duo who needs this right now 👇`,
          hashtags: [
            `#${game.toLowerCase().replace(/\s+/g, '')}`,
            '#gamingclips',
            '#gamingguide',
            platform === 'youtube_shorts' ? '#shorts' : '#reels',
          ],
          call_to_action: 'Save this post to test with your duo before tonight’s tournament!',
          platform_adaptation: {
            platform: platform === 'youtube_shorts' ? 'YouTube Shorts' : 'Instagram Reels',
            tips: [
              platform === 'youtube_shorts'
                ? 'Create a seamless audio loop from the last sentence back to the opening hook.'
                : 'Place vital text in the middle 60% vertical zone to avoid Reels UI icon overlays.',
              'Ensure sound effects emphasize every on-screen text appearance.',
            ],
          },
        },
        isDemo: true,
      });
    }

    const result = await generateContentScriptAI(
      {
        game,
        content_format,
        platform,
        target_audience: target_audience || 'Casual & competitive players',
        tone: tone || 'High-energy',
        video_length: video_length || '30-45s',
        content_objective: content_objective || 'Maximize reach and watch time',
      },
      endpoint,
      model
    );

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

    return NextResponse.json({
      success: true,
      data: {
        id: `script-${Date.now()}`,
        created_at: new Date().toISOString(),
        game,
        content_format,
        platform,
        target_audience,
        tone,
        video_length,
        content_objective,
        ...result.data!,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
