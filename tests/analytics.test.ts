import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEngagementRate, calculateAnalyticsSummary } from '../src/lib/analytics/calculator.ts';
import type { Video } from '../src/types/index.ts';

describe('Analytics Engine & Metric Calculations', () => {
  test('calculates engagement rate with complete metrics accurately', () => {
    const video = {
      views: 10000,
      likes: 800,
      comments: 150,
      shares: 50,
    };
    // (800 + 150 + 50) / 10000 * 100 = 10.0%
    const rate = calculateEngagementRate(video);
    assert.equal(rate, 10.0);
  });

  test('returns null when views are zero or negative', () => {
    assert.equal(calculateEngagementRate({ views: 0, likes: 10, comments: 2, shares: 1 }), null);
    assert.equal(calculateEngagementRate({ views: -50, likes: 10, comments: 2, shares: 1 }), null);
  });

  test('returns null when likes, comments, or shares are null (omitted, not zeroed)', () => {
    // Missing shares
    assert.equal(calculateEngagementRate({ views: 5000, likes: 200, comments: 30, shares: null }), null);
    // Missing likes
    assert.equal(calculateEngagementRate({ views: 5000, likes: null, comments: 30, shares: 10 }), null);
    // Missing comments
    assert.equal(calculateEngagementRate({ views: 5000, likes: 200, comments: null, shares: 10 }), null);
    // Undefined fields
    assert.equal(calculateEngagementRate({ views: 5000, likes: 200, comments: 10, shares: undefined as unknown as null }), null);
  });

  test('computes catalog baseline and format performance index correctly', () => {
    const sampleVideos: Video[] = [
      {
        id: 'v1',
        title: 'Minecraft Secret Door',
        game: 'Minecraft',
        platform: 'instagram_reels',
        content_format: 'Tutorial / Guide',
        published_at: '2026-10-01',
        duration_seconds: 30,
        views: 20000,
        likes: 1800,
        comments: 100,
        shares: 500, // eng: 12.0%
      },
      {
        id: 'v2',
        title: 'Valorant 1v3 Clutch',
        game: 'Valorant',
        platform: 'youtube_shorts',
        content_format: 'Clutch / Highlight',
        published_at: '2026-10-02',
        duration_seconds: 25,
        views: 10000,
        likes: 800,
        comments: 50,
        shares: 50, // eng: 9.0%
      },
      {
        id: 'v3',
        title: 'CODM Funny S&D Fail',
        game: 'CODM',
        platform: 'youtube_shorts',
        content_format: 'Fail / Funny',
        published_at: '2026-10-03',
        duration_seconds: 20,
        views: 30000,
        likes: 2400,
        comments: 200,
        shares: null, // missing share metric
      },
    ];

    const summary = calculateAnalyticsSummary(sampleVideos);

    // Total views = 20000 + 10000 + 30000 = 60000
    assert.equal(summary.total_views, 60000);
    assert.equal(summary.total_videos, 3);
    assert.equal(summary.avg_views, 20000);
    assert.equal(summary.baseline_views, 20000);

    // Complete metrics = 2 videos, missing = 1 video
    assert.equal(summary.videos_with_complete_engagement, 2);
    assert.equal(summary.videos_with_missing_metrics, 1);

    // Avg engagement rate across the 2 valid videos: (12.0 + 9.0) / 2 = 10.5%
    assert.equal(summary.avg_engagement_rate, 10.5);

    // Performance index vs baseline: Tutorial avg views = 20000, baseline = 20000 => 1.0x
    const tutorialFormat = summary.format_performance.find((f) => f.format === 'Tutorial / Guide');
    assert.ok(tutorialFormat);
    assert.equal(tutorialFormat.performance_index_vs_baseline, 1.0);
  });

  test('handles empty video list gracefully without crashing', () => {
    const summary = calculateAnalyticsSummary([]);
    assert.equal(summary.total_views, 0);
    assert.equal(summary.total_videos, 0);
    assert.equal(summary.avg_views, 0);
    assert.equal(summary.avg_engagement_rate, null);
    assert.equal(summary.format_performance.length, 0);
  });
});
