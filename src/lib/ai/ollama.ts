import { z } from 'zod';
import type { Video, AnalyticsSummary, CreatorProfile, ContentIdea, CoachingReport, ScriptGeneration } from '../../types/index.ts';

// ==============================================================================
// Zod Schemas for Structured AI Responses
// ==============================================================================

export const CoachingReportSchema = z.object({
  summary: z.string().min(10),
  top_performing_formats: z.array(
    z.object({
      format: z.string(),
      observation: z.string(),
      metric_evidence: z.string(),
    })
  ).min(1),
  underperforming_content: z.array(
    z.object({
      format: z.string(),
      observation: z.string(),
      potential_hypothesis: z.string(),
    })
  ).min(1),
  recommendations: z.array(
    z.object({
      id: z.number().default(1),
      title: z.string(),
      action: z.string(),
      evidence: z.string(),
      confidence: z.enum(['High', 'Medium', 'Low']),
      confidence_reason: z.string(),
    })
  ).min(3).max(3),
  experiments: z.array(
    z.object({
      id: z.number().default(1),
      title: z.string(),
      game: z.string(),
      format: z.string(),
      platform: z.enum(['instagram_reels', 'youtube_shorts']),
      hypothesis: z.string(),
      target_metric: z.string(),
    })
  ).min(5).max(5),
  data_quality_notes: z.string(),
});

export const ScriptGenerationSchema = z.object({
  hooks: z.array(
    z.object({
      id: z.number(),
      text: z.string(),
      style: z.string(),
    })
  ).min(3),
  script: z.string().min(20),
  scene_outline: z.array(
    z.object({
      scene_num: z.number(),
      visual: z.string(),
      audio_speech: z.string(),
      duration_estimate: z.string(),
    })
  ).min(2),
  on_screen_text: z.array(z.string()).min(1),
  caption: z.string(),
  hashtags: z.array(z.string()),
  call_to_action: z.string(),
  platform_adaptation: z.object({
    platform: z.string(),
    tips: z.array(z.string()),
  }),
});

export const WeeklyPlanSchema = z.object({
  ideas: z.array(
    z.object({
      game: z.string(),
      content_format: z.string(),
      working_title: z.string(),
      hook: z.string(),
      content_outline: z.string(),
      platform: z.enum(['instagram_reels', 'youtube_shorts']),
      objective: z.string(),
      hypothesis_to_test: z.string(),
    })
  ).min(5).max(5),
});

// ==============================================================================
// Ollama Client Helper
// ==============================================================================

export interface OllamaCallResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: 'OLLAMA_UNAVAILABLE' | 'TIMEOUT' | 'INVALID_JSON' | 'SCHEMA_VALIDATION_ERROR' | 'UNKNOWN';
  rawResponse?: string;
}

export function getOllamaConfig(customEndpoint?: string, customModel?: string) {
  const endpoint = customEndpoint || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const model = customModel || process.env.OLLAMA_MODEL || 'llama3.2:latest';
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS) || 35000;
  return { endpoint: endpoint.replace(/\/$/, ''), model, timeoutMs };
}

/**
 * Health check to verify Ollama host reachability and list available models.
 */
export async function checkOllamaHealth(customEndpoint?: string): Promise<{
  isOnline: boolean;
  models: string[];
  error?: string;
}> {
  const { endpoint } = getOllamaConfig(customEndpoint);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { isOnline: false, models: [], error: `Ollama returned HTTP status ${res.status}` };
    }
    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models.map((m: { name: string }) => m.name) : [];
    return { isOnline: true, models };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    return { isOnline: false, models: [], error: message };
  }
}

/**
 * Core server-side function to query Ollama with JSON structure enforcement.
 */
export async function queryOllamaJSON<T>(
  prompt: string,
  systemPrompt: string,
  schema: z.ZodSchema<T>,
  customEndpoint?: string,
  customModel?: string
): Promise<OllamaCallResult<T>> {
  const { endpoint, model, timeoutMs } = getOllamaConfig(customEndpoint, customModel);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        system: `${systemPrompt}\n\nCRITICAL: Respond ONLY with valid, raw JSON conforming to the requested schema. Do NOT include markdown code fences, backticks, or preamble text.`,
        prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.5,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        success: false,
        error: `Ollama returned HTTP error ${res.status}: ${res.statusText}`,
        code: 'OLLAMA_UNAVAILABLE',
      };
    }

    const responseData = await res.json();
    const rawText = responseData.response || '';

    // Clean JSON response (strip markdown fences if Ollama included them)
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```$/, '').trim();
    }

    let parsedJSON: unknown;
    try {
      parsedJSON = JSON.parse(cleanedText);
    } catch {
      return {
        success: false,
        error: 'Failed to parse JSON response from open-weight model.',
        code: 'INVALID_JSON',
        rawResponse: rawText,
      };
    }

    const validationResult = schema.safeParse(parsedJSON);
    if (!validationResult.success) {
      return {
        success: false,
        error: `Model output did not match expected schema: ${validationResult.error.message}`,
        code: 'SCHEMA_VALIDATION_ERROR',
        rawResponse: rawText,
      };
    }

    return {
      success: true,
      data: validationResult.data,
      rawResponse: rawText,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        error: `Ollama request timed out after ${timeoutMs / 1000} seconds. Ensure the model is loaded in VRAM.`,
        code: 'TIMEOUT',
      };
    }
    const message = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      success: false,
      error: `Could not connect to Ollama at ${endpoint}: ${message}. Verify that Ollama is running ('ollama serve') and model '${model}' is pulled.`,
      code: 'OLLAMA_UNAVAILABLE',
    };
  }
}

// ==============================================================================
// Domain AI Functions
// ==============================================================================

/**
 * Generates an analytical coaching report based on observed metrics and creator profile.
 */
export async function generateCoachingReportAI(
  summary: AnalyticsSummary,
  profile: CreatorProfile,
  customEndpoint?: string,
  customModel?: string
): Promise<OllamaCallResult<z.infer<typeof CoachingReportSchema>>> {
  const systemPrompt = `You are CreatorCoach AI, an objective, rigorous creator growth analyst specialized in gaming short-form videos (Reels and Shorts).
GUIDELINES:
1. Distinguish observed data from causal hypotheses. Correlation does NOT prove causation.
2. Never claim to know the platform algorithm or guarantee viral reach.
3. Clearly label all interpretations as "HYPOTHESIS:".
4. Provide exactly 3 actionable recommendations with confidence levels (High/Medium/Low) based on data evidence.
5. Provide exactly 5 testable experiments for upcoming short-form gaming videos.`;

  const prompt = `Analyze this gaming creator's data:
Creator: ${profile.creator_name} (${profile.handle})
Games: ${profile.main_games.join(', ')}
Total Videos: ${summary.total_videos}
Average Views: ${summary.avg_views}
Average Engagement Rate: ${summary.avg_engagement_rate !== null ? summary.avg_engagement_rate + '%' : 'Insufficient complete metrics'}
Catalog Baseline Views: ${summary.baseline_views}

Format Performance Breakdown:
${summary.format_performance
  .map(
    (f) =>
      `- ${f.format}: ${f.count} videos, Avg Views: ${f.avg_views} (${f.performance_index_vs_baseline}x baseline), Avg Engagement: ${f.avg_engagement_rate !== null ? f.avg_engagement_rate + '%' : 'N/A'}`
  )
  .join('\n')}

Top Performing Videos:
${summary.top_videos.map((v) => `- "${v.title}" (${v.game}, ${v.platform}): ${v.views} views, Format: ${v.content_format}`).join('\n')}

Underperforming Videos:
${summary.underperforming_videos.map((v) => `- "${v.title}" (${v.game}, ${v.platform}): ${v.views} views, Format: ${v.content_format}`).join('\n')}

Generate a JSON object matching this schema:
{
  "summary": string,
  "top_performing_formats": [
    { "format": string, "observation": string, "metric_evidence": string }
  ],
  "underperforming_content": [
    { "format": string, "observation": string, "potential_hypothesis": string }
  ],
  "recommendations": [
    { "id": 1, "title": string, "action": string, "evidence": string, "confidence": "High" | "Medium" | "Low", "confidence_reason": string }
  ],
  "experiments": [
    { "id": 1, "title": string, "game": string, "format": string, "platform": "instagram_reels" | "youtube_shorts", "hypothesis": string, "target_metric": string }
  ],
  "data_quality_notes": string
}`;

  return queryOllamaJSON(prompt, systemPrompt, CoachingReportSchema, customEndpoint, customModel);
}

/**
 * Generates video hooks, full script, scene outline, and platform adaptation.
 */
export async function generateContentScriptAI(
  params: {
    game: string;
    content_format: string;
    platform: 'instagram_reels' | 'youtube_shorts';
    target_audience: string;
    tone: string;
    video_length: string;
    content_objective: string;
  },
  customEndpoint?: string,
  customModel?: string
): Promise<OllamaCallResult<z.infer<typeof ScriptGenerationSchema>>> {
  const systemPrompt = `You are an elite short-form gaming video director for YouTube Shorts and Instagram Reels.
You understand retention hooks, on-screen text placement, fast pacing, and platform differences (IG save culture vs YT watch-time loops).`;

  const prompt = `Generate a high-converting short-form script for:
Game: ${params.game}
Format: ${params.content_format}
Platform: ${params.platform === 'youtube_shorts' ? 'YouTube Shorts' : 'Instagram Reels'}
Target Audience: ${params.target_audience}
Tone: ${params.tone}
Video Length: ${params.video_length}
Objective: ${params.content_objective}

Return a valid JSON object matching this schema:
{
  "hooks": [
    { "id": 1, "text": "First 2-second hook line", "style": "Pattern Interrupt / Shock" },
    { "id": 2, "text": "Alternative hook line", "style": "Curiosity Gap" },
    { "id": 3, "text": "Alternative hook line", "style": "Action Climax" }
  ],
  "script": "Complete spoken voiceover narration script formatted with timestamps",
  "scene_outline": [
    { "scene_num": 1, "visual": "Visual camera and game action description", "audio_speech": "Spoken line", "duration_estimate": "0-3s" }
  ],
  "on_screen_text": ["Key punchy overlay 1", "Overlay 2"],
  "caption": "Platform ready caption with spacing and hook line",
  "hashtags": ["#gaming", "#valorant", "#shorts"],
  "call_to_action": "High conversion CTA suited for the platform",
  "platform_adaptation": {
    "platform": "${params.platform}",
    "tips": ["Tip 1 regarding ${params.platform} mechanics", "Tip 2"]
  }
}`;

  return queryOllamaJSON(prompt, systemPrompt, ScriptGenerationSchema, customEndpoint, customModel);
}

/**
 * Generates 5 structured weekly video ideas with testable hypotheses.
 */
export async function generateWeeklyPlanAI(
  profile: CreatorProfile,
  summary: AnalyticsSummary,
  customEndpoint?: string,
  customModel?: string
): Promise<OllamaCallResult<z.infer<typeof WeeklyPlanSchema>>> {
  const systemPrompt = `You are a strategic gaming content producer. Generate 5 cohesive, high-retention video concepts for the upcoming week based on data patterns.`;

  const prompt = `Creator: ${profile.creator_name}
Main Games: ${profile.main_games.join(', ')}
Weekly Posting Goal: ${profile.weekly_goals.target_posts} videos
Top Formats: ${summary.format_performance.slice(0, 2).map((f) => f.format).join(', ')}

Return a JSON object with exactly 5 ideas:
{
  "ideas": [
    {
      "game": "Minecraft",
      "content_format": "Tutorial / Guide",
      "working_title": "Descriptive title",
      "hook": "Spoken hook",
      "content_outline": "Step by step synopsis",
      "platform": "instagram_reels",
      "objective": "Clear goal",
      "hypothesis_to_test": "Measurable hypothesis"
    }
  ]
}`;

  return queryOllamaJSON(prompt, systemPrompt, WeeklyPlanSchema, customEndpoint, customModel);
}
