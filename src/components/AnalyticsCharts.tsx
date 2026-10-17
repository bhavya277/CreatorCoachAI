'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { FormatPerformance, TrendDataPoint, PlatformPerformance, GamePerformance } from '@/types';
import { formatNumber, formatPercent } from '@/lib/utils';

const COLORS = ['#8b5cf6', '#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899'];

interface FormatChartProps {
  data: FormatPerformance[];
  baselineViews: number;
}

export function FormatComparisonChart({ data, baselineViews }: FormatChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No format data available.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.format.split('/')[0].trim(),
    fullName: item.format,
    avgViews: item.avg_views,
    count: item.count,
    engagement: item.avg_engagement_rate,
    indexVsBaseline: item.performance_index_vs_baseline,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatNumber(v)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-3 bg-[#11141e] border border-white/[0.12] rounded-xl shadow-xl text-xs space-y-1.5">
                    <p className="font-bold text-white">{item.fullName}</p>
                    <p className="text-purple-400 font-semibold">
                      Avg Views: {item.avgViews.toLocaleString()}
                    </p>
                    <p className="text-slate-300">
                      Performance vs Baseline: <span className={item.indexVsBaseline >= 1 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>{(item.indexVsBaseline * 100).toFixed(0)}%</span>
                    </p>
                    <p className="text-slate-400">
                      Avg Engagement: {item.engagement ? formatPercent(item.engagement) : '—'} ({item.count} videos)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="avgViews" radius={[6, 6, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TrendChartProps {
  data: TrendDataPoint[];
}

export function PerformanceTrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No trend records available.
      </div>
    );
  }

  const chartData = data.slice(-12).map((item) => ({
    date: item.date.slice(5), // MM-DD
    title: item.title,
    views: item.views,
    game: item.game,
    platform: item.platform === 'youtube_shorts' ? 'YouTube' : 'Instagram',
    engagement: item.engagement_rate,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatNumber(v)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-3 bg-[#11141e] border border-white/[0.12] rounded-xl shadow-xl text-xs space-y-1.5 max-w-xs">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      {item.game} • {item.platform} ({item.date})
                    </p>
                    <p className="text-cyan-400 font-semibold">
                      Views: {item.views.toLocaleString()}
                    </p>
                    <p className="text-purple-300">
                      Engagement Rate: {item.engagement !== null ? formatPercent(item.engagement) : 'Omitted / Null'}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 1.5, stroke: '#ffffff' }}
            activeDot={{ r: 6, fill: '#c084fc' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PlatformComparisonProps {
  data: PlatformPerformance[];
}

export function PlatformComparisonBars({ data }: PlatformComparisonProps) {
  const chartData = data.map((item) => ({
    name: item.platform === 'youtube_shorts' ? 'YouTube Shorts' : 'Instagram Reels',
    views: item.total_views,
    avg: item.avg_views,
    count: item.count,
    engagement: item.avg_engagement_rate,
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 15, left: 35, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatNumber(v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-3 bg-[#11141e] border border-white/[0.12] rounded-xl shadow-xl text-xs space-y-1">
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-purple-400 font-semibold">Total Views: {item.views.toLocaleString()}</p>
                    <p className="text-slate-300">Avg Views: {item.avg.toLocaleString()}</p>
                    <p className="text-slate-400">Videos: {item.count} | Eng: {item.engagement ? formatPercent(item.engagement) : '—'}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="views" radius={[0, 6, 6, 0]}>
            <Cell fill="#ef4444" />
            <Cell fill="#a855f7" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
