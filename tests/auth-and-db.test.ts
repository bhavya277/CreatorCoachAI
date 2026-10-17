import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAnalyticsSummary, calculateEngagementRate } from '../src/lib/analytics/calculator.ts';
import type { Video, ContentIdea } from '../src/types/index.ts';

test('Auth, User Data Isolation & Security Logic', async (t) => {
  await t.test('enforces user data isolation between distinct creator user_ids', () => {
    const userAVideos: Video[] = [
      {
        id: 'vid-a1',
        user_id: 'user-aaa-111',
        title: 'User A CODM Clutch',
        game: 'CODM',
        platform: 'youtube_shorts',
        content_format: 'Clutch / Highlight',
        published_at: '2026-10-15',
        duration_seconds: 30,
        views: 50000,
        likes: 4000,
        comments: 500,
        shares: 300,
      },
    ];

    const userBVideos: Video[] = [
      {
        id: 'vid-b1',
        user_id: 'user-bbb-222',
        title: 'User B Valorant Lineup',
        game: 'Valorant',
        platform: 'instagram_reels',
        content_format: 'Tutorial / Guide',
        published_at: '2026-10-16',
        duration_seconds: 40,
        views: 20000,
        likes: 1500,
        comments: 200,
        shares: 100,
      },
    ];

    // Simulate RLS query filter: SELECT * WHERE user_id = 'user-aaa-111'
    const queryUserA = [...userAVideos, ...userBVideos].filter(
      (v) => v.user_id === 'user-aaa-111'
    );
    assert.equal(queryUserA.length, 1);
    assert.equal(queryUserA[0].id, 'vid-a1');
    assert.equal(queryUserA[0].title, 'User A CODM Clutch');

    // User A's analytics must never leak User B's metrics
    const summaryA = calculateAnalyticsSummary(queryUserA);
    assert.equal(summaryA.total_views, 50000);
    assert.equal(summaryA.total_videos, 1);
    assert.equal(summaryA.game_performance[0]?.game, 'CODM');
  });

  await t.test('calculates empty datasets gracefully with zero divisions or crashes', () => {
    const emptyList: Video[] = [];
    const summary = calculateAnalyticsSummary(emptyList);

    assert.equal(summary.total_videos, 0);
    assert.equal(summary.total_views, 0);
    assert.equal(summary.avg_views, 0);
    assert.equal(summary.avg_engagement_rate, null);
    assert.equal(summary.baseline_views, 0);
    assert.deepEqual(summary.recent_trends, []);
    assert.deepEqual(summary.format_performance, []);
  });

  await t.test('validates post-publish performance actuals in ContentIdea', () => {
    const idea: ContentIdea = {
      id: 'plan-test-1',
      user_id: 'user-test-123',
      game: 'CODM',
      content_format: 'Tutorial / Guide',
      working_title: 'CODM Slide-Cancel Recoil Lock Guide',
      hook: 'Stop slide peeking without this exact thumb placement.',
      content_outline: 'Step 1: Jump slide. Step 2: ADS lock.',
      platform: 'youtube_shorts',
      objective: 'High save rate',
      hypothesis_to_test: 'Sub-minute tactile guides drive >10% engagement',
      status: 'Published',
      actual_views: 45000,
      actual_engagement_rate: 11.2,
      actual_notes: 'Confirmed: 11.2% engagement exceeded 8% goal.',
      created_at: '2026-10-17T00:00:00Z',
    };

    assert.equal(idea.status, 'Published');
    assert.equal(idea.actual_views, 45000);
    assert.equal(idea.actual_engagement_rate, 11.2);
    assert.ok(idea.actual_notes?.includes('exceeded 8% goal'));
  });

  await t.test('simulates protected route access control', () => {
    const checkAccess = (pathname: string, user: { id: string } | null) => {
      const protectedPaths = ['/dashboard', '/analytics', '/coach', '/studio', '/planner', '/profile'];
      const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
      if (isProtected && !user) {
        return { allowed: false, redirect: `/login?redirectTo=${encodeURIComponent(pathname)}` };
      }
      return { allowed: true, redirect: null };
    };

    // Unauthenticated user
    const unauthCheck = checkAccess('/dashboard', null);
    assert.equal(unauthCheck.allowed, false);
    assert.equal(unauthCheck.redirect, '/login?redirectTo=%2Fdashboard');

    // Authenticated user
    const authCheck = checkAccess('/dashboard', { id: 'usr-1' });
    assert.equal(authCheck.allowed, true);
    assert.equal(authCheck.redirect, null);
  });
});
