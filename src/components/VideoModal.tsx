'use client';

import React, { useState, useEffect } from 'react';
import { Video, Game, Platform, ContentFormat } from '@/types';
import { X, Check, Gamepad2, Info } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (video: Video) => void;
  initialVideo?: Video | null;
}

export function VideoModal({ isOpen, onClose, onSave, initialVideo }: VideoModalProps) {
  const [formData, setFormData] = useState<Partial<Video>>({
    title: '',
    game: 'Valorant',
    platform: 'youtube_shorts',
    content_format: 'Clutch / Highlight',
    published_at: '2026-10-17',
    duration_seconds: 35,
    views: 1000,
    likes: 100,
    comments: 15,
    shares: 20,
    retention_rate_pct: 65,
    notes: '',
  });

  const [missingMetricsChoice, setMissingMetricsChoice] = useState({
    likesMissing: false,
    commentsMissing: false,
    sharesMissing: false,
  });

  useEffect(() => {
    if (initialVideo) {
      setFormData(initialVideo);
      setMissingMetricsChoice({
        likesMissing: initialVideo.likes === null,
        commentsMissing: initialVideo.comments === null,
        sharesMissing: initialVideo.shares === null,
      });
    } else {
      setFormData({
        title: '',
        game: 'Valorant',
        platform: 'youtube_shorts',
        content_format: 'Clutch / Highlight',
        published_at: new Date().toISOString().split('T')[0],
        duration_seconds: 35,
        views: 2500,
        likes: 240,
        comments: 28,
        shares: 45,
        retention_rate_pct: 65,
        notes: '',
      });
      setMissingMetricsChoice({
        likesMissing: false,
        commentsMissing: false,
        sharesMissing: false,
      });
    }
  }, [initialVideo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const video: Video = {
      id: initialVideo?.id || `vid-${Date.now()}`,
      title: formData.title || 'Untitled Gaming Short',
      game: (formData.game as Game) || 'Other',
      platform: (formData.platform as Platform) || 'youtube_shorts',
      content_format: (formData.content_format as ContentFormat) || 'Clutch / Highlight',
      published_at: formData.published_at || new Date().toISOString().split('T')[0],
      duration_seconds: Number(formData.duration_seconds) || 30,
      views: Number(formData.views) || 0,
      likes: missingMetricsChoice.likesMissing ? null : Number(formData.likes) || 0,
      comments: missingMetricsChoice.commentsMissing ? null : Number(formData.comments) || 0,
      shares: missingMetricsChoice.sharesMissing ? null : Number(formData.shares) || 0,
      retention_rate_pct: formData.retention_rate_pct !== null && formData.retention_rate_pct !== undefined ? Number(formData.retention_rate_pct) : null,
      notes: formData.notes || '',
    };

    onSave(video);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#11141e] border border-white/[0.12] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] bg-[#0c0f17]">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {initialVideo ? 'Edit Gaming Video' : 'Add Gaming Video'}
              </h2>
              <p className="text-xs text-slate-400 truncate hidden xs:block">
                Track views, engagements, and gameplay formats for deterministic analytics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Video Title / Hook *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 1v4 Sova Clutch with Shock Dart Lineup"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Game & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Game
              </label>
              <select
                value={formData.game}
                onChange={(e) => setFormData({ ...formData, game: e.target.value as Game })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161a26] border border-white/[0.1] text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Minecraft">Minecraft</option>
                <option value="Valorant">Valorant</option>
                <option value="BGMI">BGMI</option>
                <option value="CODM">CODM (Call of Duty: Mobile)</option>
                <option value="Apex Legends">Apex Legends</option>
                <option value="GTA V">GTA V</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161a26] border border-white/[0.1] text-white focus:outline-none focus:border-purple-500"
              >
                <option value="youtube_shorts">YouTube Shorts</option>
                <option value="instagram_reels">Instagram Reels</option>
              </select>
            </div>
          </div>

          {/* Content Format & Publish Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Content Format
              </label>
              <select
                value={formData.content_format}
                onChange={(e) => setFormData({ ...formData, content_format: e.target.value as ContentFormat })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161a26] border border-white/[0.1] text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Tutorial / Guide">Tutorial / Guide</option>
                <option value="Clutch / Highlight">Clutch / Highlight</option>
                <option value="Fail / Funny">Fail / Funny</option>
                <option value="Challenge / Experiment">Challenge / Experiment</option>
                <option value="News / Lore">News / Lore</option>
                <option value="Review / Tier List">Review / Tier List</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Publish Date
              </label>
              <input
                type="date"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Views & Retention Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Total Views *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.views}
                onChange={(e) => setFormData({ ...formData, views: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={formData.duration_seconds}
                onChange={(e) => setFormData({ ...formData, duration_seconds: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Retention Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 68.5"
                value={formData.retention_rate_pct ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    retention_rate_pct: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Engagement Metrics (Likes, Comments, Shares) with Missing Metric Handling */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Engagement Metrics
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Missing values are omitted, not zeroed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Likes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300">Likes</label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={missingMetricsChoice.likesMissing}
                      onChange={(e) =>
                        setMissingMetricsChoice({ ...missingMetricsChoice, likesMissing: e.target.checked })
                      }
                      className="rounded bg-white/[0.1] border-slate-700 text-purple-600 focus:ring-0"
                    />
                    <span>Omit</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={missingMetricsChoice.likesMissing}
                  value={missingMetricsChoice.likesMissing ? '' : formData.likes ?? ''}
                  onChange={(e) => setFormData({ ...formData, likes: Number(e.target.value) })}
                  placeholder={missingMetricsChoice.likesMissing ? 'Omitted (Null)' : '0'}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Comments */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300">Comments</label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={missingMetricsChoice.commentsMissing}
                      onChange={(e) =>
                        setMissingMetricsChoice({ ...missingMetricsChoice, commentsMissing: e.target.checked })
                      }
                      className="rounded bg-white/[0.1] border-slate-700 text-purple-600 focus:ring-0"
                    />
                    <span>Omit</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={missingMetricsChoice.commentsMissing}
                  value={missingMetricsChoice.commentsMissing ? '' : formData.comments ?? ''}
                  onChange={(e) => setFormData({ ...formData, comments: Number(e.target.value) })}
                  placeholder={missingMetricsChoice.commentsMissing ? 'Omitted (Null)' : '0'}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Shares */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300">Shares / Saves</label>
                  <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={missingMetricsChoice.sharesMissing}
                      onChange={(e) =>
                        setMissingMetricsChoice({ ...missingMetricsChoice, sharesMissing: e.target.checked })
                      }
                      className="rounded bg-white/[0.1] border-slate-700 text-purple-600 focus:ring-0"
                    />
                    <span>Omit</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={missingMetricsChoice.sharesMissing}
                  value={missingMetricsChoice.sharesMissing ? '' : formData.shares ?? ''}
                  onChange={(e) => setFormData({ ...formData, shares: Number(e.target.value) })}
                  placeholder={missingMetricsChoice.sharesMissing ? 'Omitted (Null)' : '0'}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Creator Notes & Observations
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Fast zoom hook in first 2 seconds; strong comment discussion on shotgun balance."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-white/[0.08] flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all text-center"
            >
              <Check className="w-4 h-4" />
              <span>{initialVideo ? 'Save Changes' : 'Add Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
