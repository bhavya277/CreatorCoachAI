import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  CoachingReportSchema,
  ScriptGenerationSchema,
  WeeklyPlanSchema,
} from '../src/lib/ai/ollama.ts';

describe('AI Zod Schemas & Structured Response Validation', () => {
  test('validates a valid CoachingReport structure', () => {
    const validReport = {
      summary: 'High view velocity observed on tutorial guides compared to lore breakdowns.',
      top_performing_formats: [
        {
          format: 'Tutorial / Guide',
          observation: 'Averages 35K views with 12% engagement.',
          metric_evidence: '3 videos exceeded 30K views.',
        },
      ],
      underperforming_content: [
        {
          format: 'News / Lore',
          observation: 'Only reached 11K views.',
          potential_hypothesis: 'HYPOTHESIS: Audience prefers active gameplay over static lore.',
        },
      ],
      recommendations: [
        {
          id: 1,
          title: 'Produce 2 weekly guides',
          action: 'Focus on 30s redstone tricks.',
          evidence: 'High save rate.',
          confidence: 'High',
          confidence_reason: '5 video sample size.',
        },
        {
          id: 2,
          title: 'Trim intros',
          action: 'Start hook at 0.5s.',
          evidence: 'Drops off after 2s.',
          confidence: 'Medium',
          confidence_reason: 'Moderate variance.',
        },
        {
          id: 3,
          title: 'Test myth busting',
          action: 'Turn static lore into experiments.',
          evidence: 'Experiments average 25K.',
          confidence: 'Low',
          confidence_reason: 'Single data point.',
        },
      ],
      experiments: [
        { id: 1, title: 'Exp 1', game: 'Minecraft', format: 'Tutorial / Guide', platform: 'instagram_reels', hypothesis: 'Hyp 1', target_metric: 'Metric 1' },
        { id: 2, title: 'Exp 2', game: 'Valorant', format: 'Clutch / Highlight', platform: 'youtube_shorts', hypothesis: 'Hyp 2', target_metric: 'Metric 2' },
        { id: 3, title: 'Exp 3', game: 'BGMI', format: 'Fail / Funny', platform: 'instagram_reels', hypothesis: 'Hyp 3', target_metric: 'Metric 3' },
        { id: 4, title: 'Exp 4', game: 'CODM', format: 'Review / Tier List', platform: 'youtube_shorts', hypothesis: 'Hyp 4', target_metric: 'Metric 4' },
        { id: 5, title: 'Exp 5', game: 'Minecraft', format: 'Challenge / Experiment', platform: 'youtube_shorts', hypothesis: 'Hyp 5', target_metric: 'Metric 5' },
      ],
      data_quality_notes: '18 videos analyzed.',
    };

    const parsed = CoachingReportSchema.safeParse(validReport);
    assert.equal(parsed.success, true);
  });

  test('rejects coaching report with invalid confidence value', () => {
    const invalidReport = {
      summary: 'Short summary here.',
      top_performing_formats: [{ format: 'Clutch', observation: 'High views', metric_evidence: '10K' }],
      underperforming_content: [{ format: 'Lore', observation: 'Low', potential_hypothesis: 'Hyp' }],
      recommendations: [
        { id: 1, title: 'R1', action: 'A1', evidence: 'E1', confidence: 'SuperHigh', confidence_reason: 'Reason' }, // Invalid enum
        { id: 2, title: 'R2', action: 'A2', evidence: 'E2', confidence: 'Medium', confidence_reason: 'Reason' },
        { id: 3, title: 'R3', action: 'A3', evidence: 'E3', confidence: 'Low', confidence_reason: 'Reason' },
      ],
      experiments: [
        { id: 1, title: 'E1', game: 'Valorant', format: 'Clutch', platform: 'youtube_shorts', hypothesis: 'H', target_metric: 'T' },
        { id: 2, title: 'E2', game: 'Valorant', format: 'Clutch', platform: 'youtube_shorts', hypothesis: 'H', target_metric: 'T' },
        { id: 3, title: 'E3', game: 'Valorant', format: 'Clutch', platform: 'youtube_shorts', hypothesis: 'H', target_metric: 'T' },
        { id: 4, title: 'E4', game: 'Valorant', format: 'Clutch', platform: 'youtube_shorts', hypothesis: 'H', target_metric: 'T' },
        { id: 5, title: 'E5', game: 'Valorant', format: 'Clutch', platform: 'youtube_shorts', hypothesis: 'H', target_metric: 'T' },
      ],
      data_quality_notes: 'Notes',
    };

    const parsed = CoachingReportSchema.safeParse(invalidReport);
    assert.equal(parsed.success, false);
  });

  test('validates ScriptGenerationSchema requirements', () => {
    const validScript = {
      hooks: [
        { id: 1, text: 'Hook 1', style: 'Shock' },
        { id: 2, text: 'Hook 2', style: 'Curiosity' },
        { id: 3, text: 'Hook 3', style: 'Climax' },
      ],
      script: 'This is the complete spoken voiceover script narration line.',
      scene_outline: [
        { scene_num: 1, visual: 'Cut to game', audio_speech: 'Opening line', duration_estimate: '0-3s' },
        { scene_num: 2, visual: 'Show trick', audio_speech: 'Second line', duration_estimate: '3-15s' },
      ],
      on_screen_text: ['TRICK OVERLAY'],
      caption: 'Test caption #shorts',
      hashtags: ['#valorant', '#shorts'],
      call_to_action: 'Save this post!',
      platform_adaptation: {
        platform: 'youtube_shorts',
        tips: ['Loop audio seamlessly'],
      },
    };

    const parsed = ScriptGenerationSchema.safeParse(validScript);
    assert.equal(parsed.success, true);
  });

  test('WeeklyPlanSchema enforces exactly 5 ideas', () => {
    const fourIdeas = {
      ideas: [
        { game: 'Valorant', content_format: 'Clutch', working_title: 'T1', hook: 'H1', content_outline: 'O1', platform: 'youtube_shorts', objective: 'Obj1', hypothesis_to_test: 'Hyp1' },
        { game: 'Valorant', content_format: 'Clutch', working_title: 'T2', hook: 'H2', content_outline: 'O2', platform: 'youtube_shorts', objective: 'Obj2', hypothesis_to_test: 'Hyp2' },
        { game: 'Valorant', content_format: 'Clutch', working_title: 'T3', hook: 'H3', content_outline: 'O3', platform: 'youtube_shorts', objective: 'Obj3', hypothesis_to_test: 'Hyp3' },
        { game: 'Valorant', content_format: 'Clutch', working_title: 'T4', hook: 'H4', content_outline: 'O4', platform: 'youtube_shorts', objective: 'Obj4', hypothesis_to_test: 'Hyp4' },
      ],
    };

    const parsed = WeeklyPlanSchema.safeParse(fourIdeas);
    assert.equal(parsed.success, false); // Fails min(5)
  });
});
