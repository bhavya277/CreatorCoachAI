import type {
  Video,
  AnalyticsSummary,
  FormatPerformance,
  PlatformPerformance,
  GamePerformance,
  ContentFormat,
  Platform,
  Game,
  TrendDataPoint,
} from '../../types/index.ts';

/**
 * Calculates engagement rate according to strict documented criteria:
 * Formula: ((likes + comments + shares) / views) * 100
 * 
 * Rules:
 * 1. Views must be strictly > 0.
 * 2. Likes, comments, and shares MUST all be non-null and non-undefined.
 * 3. If any field is missing, returns `null` rather than coercing missing to 0.
 */
export function calculateEngagementRate(video: Pick<Video, 'views' | 'likes' | 'comments' | 'shares'>): number | null {
  if (!video.views || video.views <= 0) {
    return null;
  }
  if (video.likes === null || video.comments === null || video.shares === null) {
    return null;
  }
  if (video.likes === undefined || video.comments === undefined || video.shares === undefined) {
    return null;
  }
  const totalEngagement = video.likes + video.comments + video.shares;
  return Number(((totalEngagement / video.views) * 100).toFixed(2));
}

/**
 * Computes deterministic aggregated analytics across the creator's video catalog.
 */
export function calculateAnalyticsSummary(videos: Video[]): AnalyticsSummary {
  if (!videos || videos.length === 0) {
    return {
      total_views: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      total_videos: 0,
      avg_views: 0,
      baseline_views: 0,
      avg_engagement_rate: null,
      videos_with_complete_engagement: 0,
      videos_with_missing_metrics: 0,
      format_performance: [],
      platform_performance: [],
      game_performance: [],
      recent_trends: [],
      top_videos: [],
      underperforming_videos: [],
    };
  }

  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let completeEngagementCount = 0;
  let missingMetricsCount = 0;
  const validEngagementRates: number[] = [];

  videos.forEach((v) => {
    totalViews += v.views || 0;
    if (v.likes !== null && v.likes !== undefined) totalLikes += v.likes;
    if (v.comments !== null && v.comments !== undefined) totalComments += v.comments;
    if (v.shares !== null && v.shares !== undefined) totalShares += v.shares;

    const rate = calculateEngagementRate(v);
    if (rate !== null) {
      validEngagementRates.push(rate);
      completeEngagementCount++;
    } else {
      missingMetricsCount++;
    }
  });

  const totalVideos = videos.length;
  const avgViews = Math.round(totalViews / totalVideos);
  const baselineViews = avgViews; // Creator's catalog baseline

  const avgEngagementRate =
    validEngagementRates.length > 0
      ? Number(
          (
            validEngagementRates.reduce((acc, curr) => acc + curr, 0) /
            validEngagementRates.length
          ).toFixed(2)
        )
      : null;

  // Group by Content Format
  const formatMap = new Map<
    ContentFormat,
    { count: number; totalViews: number; validRates: number[] }
  >();

  // Group by Platform
  const platformMap = new Map<
    Platform,
    { count: number; totalViews: number; validRates: number[] }
  >();

  // Group by Game
  const gameMap = new Map<
    Game,
    { count: number; totalViews: number; validRates: number[] }
  >();

  videos.forEach((v) => {
    // Format
    const currentFormat = formatMap.get(v.content_format) || { count: 0, totalViews: 0, validRates: [] };
    currentFormat.count += 1;
    currentFormat.totalViews += v.views || 0;
    const rate = calculateEngagementRate(v);
    if (rate !== null) currentFormat.validRates.push(rate);
    formatMap.set(v.content_format, currentFormat);

    // Platform
    const currentPlatform = platformMap.get(v.platform) || { count: 0, totalViews: 0, validRates: [] };
    currentPlatform.count += 1;
    currentPlatform.totalViews += v.views || 0;
    if (rate !== null) currentPlatform.validRates.push(rate);
    platformMap.set(v.platform, currentPlatform);

    // Game
    const currentGame = gameMap.get(v.game) || { count: 0, totalViews: 0, validRates: [] };
    currentGame.count += 1;
    currentGame.totalViews += v.views || 0;
    if (rate !== null) currentGame.validRates.push(rate);
    gameMap.set(v.game, currentGame);
  });

  const format_performance: FormatPerformance[] = Array.from(formatMap.entries()).map(
    ([format, data]) => {
      const avg = Math.round(data.totalViews / data.count);
      const avgEng =
        data.validRates.length > 0
          ? Number(
              (
                data.validRates.reduce((a, b) => a + b, 0) /
                data.validRates.length
              ).toFixed(2)
            )
          : null;
      const index = baselineViews > 0 ? Number((avg / baselineViews).toFixed(2)) : 1.0;
      return {
        format,
        count: data.count,
        total_views: data.totalViews,
        avg_views: avg,
        avg_engagement_rate: avgEng,
        performance_index_vs_baseline: index,
      };
    }
  ).sort((a, b) => b.avg_views - a.avg_views);

  const platform_performance: PlatformPerformance[] = Array.from(platformMap.entries()).map(
    ([platform, data]) => {
      const avg = Math.round(data.totalViews / data.count);
      const avgEng =
        data.validRates.length > 0
          ? Number(
              (
                data.validRates.reduce((a, b) => a + b, 0) /
                data.validRates.length
              ).toFixed(2)
            )
          : null;
      return {
        platform,
        count: data.count,
        total_views: data.totalViews,
        avg_views: avg,
        avg_engagement_rate: avgEng,
      };
    }
  ).sort((a, b) => b.total_views - a.total_views);

  const game_performance: GamePerformance[] = Array.from(gameMap.entries()).map(
    ([game, data]) => {
      const avg = Math.round(data.totalViews / data.count);
      const avgEng =
        data.validRates.length > 0
          ? Number(
              (
                data.validRates.reduce((a, b) => a + b, 0) /
                data.validRates.length
              ).toFixed(2)
            )
          : null;
      return {
        game,
        count: data.count,
        total_views: data.totalViews,
        avg_views: avg,
        avg_engagement_rate: avgEng,
      };
    }
  ).sort((a, b) => b.total_views - a.total_views);

  // Chronological Trends (sorted by published_at ascending)
  const sortedChronologically = [...videos].sort(
    (a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
  );

  const recent_trends: TrendDataPoint[] = sortedChronologically.map((v) => ({
    date: v.published_at,
    title: v.title,
    game: v.game,
    platform: v.platform,
    views: v.views,
    likes: v.likes,
    comments: v.comments,
    shares: v.shares,
    engagement_rate: calculateEngagementRate(v),
  }));

  // Top Videos (by views descending)
  const sortedByViews = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));
  const top_videos = sortedByViews.slice(0, 5);
  const underperforming_videos = sortedByViews.slice(-5).reverse();

  return {
    total_views: totalViews,
    total_likes: totalLikes,
    total_comments: totalComments,
    total_shares: totalShares,
    total_videos: totalVideos,
    avg_views: avgViews,
    baseline_views: baselineViews,
    avg_engagement_rate: avgEngagementRate,
    videos_with_complete_engagement: completeEngagementCount,
    videos_with_missing_metrics: missingMetricsCount,
    format_performance,
    platform_performance,
    game_performance,
    recent_trends,
    top_videos,
    underperforming_videos,
  };
}
