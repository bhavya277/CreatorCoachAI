'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Video, Game, Platform, ContentFormat } from '@/types';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, Download } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (videos: Video[]) => void;
}

export function CsvImportModal({ isOpen, onClose, onImportSuccess }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState({
    title: 'title',
    game: 'game',
    platform: 'platform',
    content_format: 'content_format',
    views: 'views',
    likes: 'likes',
    comments: 'comments',
    shares: 'shares',
    published_at: 'published_at',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewVideos, setPreviewVideos] = useState<Video[]>([]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setParsing(true);
    setValidationErrors([]);

    Papa.parse<Record<string, string>>(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsing(false);
        const data = results.data;
        if (data.length === 0) {
          setValidationErrors(['The uploaded CSV contains no records.']);
          return;
        }

        const cols = Object.keys(data[0] || {});
        setHeaders(cols);
        setParsedRows(data);

        // Auto-match headers to field mapping
        const newMapping = { ...fieldMapping };
        cols.forEach((col) => {
          const lower = col.toLowerCase().trim();
          if (lower.includes('title') || lower.includes('hook') || lower.includes('name')) newMapping.title = col;
          if (lower.includes('game')) newMapping.game = col;
          if (lower.includes('platform')) newMapping.platform = col;
          if (lower.includes('format') || lower.includes('type')) newMapping.content_format = col;
          if (lower.includes('view')) newMapping.views = col;
          if (lower.includes('like')) newMapping.likes = col;
          if (lower.includes('comment')) newMapping.comments = col;
          if (lower.includes('share') || lower.includes('save')) newMapping.shares = col;
          if (lower.includes('date') || lower.includes('publish')) newMapping.published_at = col;
        });
        setFieldMapping(newMapping);
        generatePreview(data, newMapping);
      },
      error: (error) => {
        setParsing(false);
        setValidationErrors([`CSV Parsing error: ${error.message}`]);
      },
    });
  };

  const generatePreview = (rows: Record<string, string>[], mapping: typeof fieldMapping) => {
    const converted: Video[] = [];
    const errors: string[] = [];

    rows.forEach((row, idx) => {
      const rawTitle = row[mapping.title]?.trim();
      if (!rawTitle) {
        errors.push(`Row #${idx + 1}: Missing video title.`);
        return;
      }

      const rawGame = (row[mapping.game] || 'Other').trim();
      const rawPlatform = (row[mapping.platform] || 'youtube_shorts').toLowerCase().trim();
      const rawFormat = (row[mapping.content_format] || 'Clutch / Highlight').trim();
      const rawViews = Number(row[mapping.views]) || 0;

      // Missing metric check: if cell is empty or null, treat as null
      const rawLikes = row[mapping.likes];
      const likes = rawLikes !== undefined && rawLikes !== '' && !isNaN(Number(rawLikes)) ? Number(rawLikes) : null;

      const rawComments = row[mapping.comments];
      const comments = rawComments !== undefined && rawComments !== '' && !isNaN(Number(rawComments)) ? Number(rawComments) : null;

      const rawShares = row[mapping.shares];
      const shares = rawShares !== undefined && rawShares !== '' && !isNaN(Number(rawShares)) ? Number(rawShares) : null;

      let normalizedPlatform: Platform = 'youtube_shorts';
      if (rawPlatform.includes('insta') || rawPlatform.includes('reel')) {
        normalizedPlatform = 'instagram_reels';
      }

      let normalizedGame: Game = 'Other';
      if (rawGame.toLowerCase().includes('minecraft')) normalizedGame = 'Minecraft';
      else if (rawGame.toLowerCase().includes('valorant')) normalizedGame = 'Valorant';
      else if (rawGame.toLowerCase().includes('bgmi') || rawGame.toLowerCase().includes('pubg')) normalizedGame = 'BGMI';
      else if (rawGame.toLowerCase().includes('codm') || rawGame.toLowerCase().includes('cod') || rawGame.toLowerCase().includes('call of duty')) normalizedGame = 'CODM';
      else if (rawGame.toLowerCase().includes('apex')) normalizedGame = 'Apex Legends';
      else if (rawGame.toLowerCase().includes('gta')) normalizedGame = 'GTA V';

      let normalizedFormat: ContentFormat = 'Clutch / Highlight';
      const fLower = rawFormat.toLowerCase();
      if (fLower.includes('guide') || fLower.includes('tutorial')) normalizedFormat = 'Tutorial / Guide';
      else if (fLower.includes('fail') || fLower.includes('funny')) normalizedFormat = 'Fail / Funny';
      else if (fLower.includes('challenge') || fLower.includes('experiment')) normalizedFormat = 'Challenge / Experiment';
      else if (fLower.includes('lore') || fLower.includes('news')) normalizedFormat = 'News / Lore';
      else if (fLower.includes('tier') || fLower.includes('review')) normalizedFormat = 'Review / Tier List';

      converted.push({
        id: `csv-${Date.now()}-${idx + 1}`,
        title: rawTitle,
        game: normalizedGame,
        platform: normalizedPlatform,
        content_format: normalizedFormat,
        published_at: row[mapping.published_at] || '2026-10-17',
        duration_seconds: 35,
        views: rawViews,
        likes,
        comments,
        shares,
        notes: 'Imported via CSV',
      });
    });

    setPreviewVideos(converted);
    setValidationErrors(errors);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent =
      'title,game,platform,content_format,views,likes,comments,shares,published_at\n' +
      '"Minecraft 1-Tick Redstone Trap",Minecraft,instagram_reels,Tutorial / Guide,34200,2890,210,840,2026-10-10\n' +
      '"Valorant Ace with Chamber Headhunter",Valorant,youtube_shorts,Clutch / Highlight,41800,3800,340,710,2026-10-12\n' +
      '"BGMI Hotdrop Pochinki Squad Wipe",BGMI,youtube_shorts,Clutch / Highlight,28900,2400,190,,2026-10-14\n' +
      '"CODM Season 9 CBR4 Meta Loadout Breakdown",CODM,youtube_shorts,Review / Tier List,24200,1650,310,480,2026-10-15\n' +
      '"When Teammate Drops Spike in Enemy Spawn",Valorant,instagram_reels,Fail / Funny,22400,1850,290,320,2026-10-16';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_gaming_videos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = () => {
    if (previewVideos.length === 0) return;
    onImportSuccess(previewVideos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#11141e] border border-white/[0.12] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] bg-[#0c0f17]">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">Import Gaming Videos from CSV</h2>
              <p className="text-xs text-slate-400 truncate hidden xs:block">
                Upload your export from YouTube Studio or Instagram Insights. Field mapping auto-adapts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* File Upload Zone */}
          {!file ? (
            <div className="border-2 border-dashed border-white/[0.15] hover:border-purple-500/50 rounded-2xl p-4 sm:p-8 text-center flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                Drag and drop your CSV file, or browse
              </h3>
              <p className="text-xs text-slate-400 max-w-md mb-4">
                Supports YouTube Studio and Instagram exports with headers for title, views, likes, comments, and shares.
              </p>

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/30 transition-all">
                <span>Select CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="mt-5 sm:mt-6 pt-4 border-t border-white/[0.08] w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Gaming CSV Template</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {parsedRows.length} rows detected • {previewVideos.length} valid records
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedRows([]);
                    setPreviewVideos([]);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-400 text-left sm:text-right"
                >
                  Replace File
                </button>
              </div>

              {/* Field Mapping Configuration */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Column Field Mapping
                </h4>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {Object.entries(fieldMapping).map(([key, colValue]) => (
                    <div key={key}>
                      <label className="block text-[11px] text-slate-400 mb-1 capitalize">
                        {key.replace('_', ' ')}:
                      </label>
                      <select
                        value={colValue}
                        onChange={(e) => {
                          const updated = { ...fieldMapping, [key]: e.target.value };
                          setFieldMapping(updated);
                          generatePreview(parsedRows, updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#161a26] border border-white/[0.1] text-white focus:outline-none focus:border-purple-500"
                      >
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Feedback */}
              {validationErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Import Warnings ({validationErrors.length})</span>
                  </div>
                  {validationErrors.slice(0, 3).map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}

              {/* Preview Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Preview (First 4 rows):
                </h4>
                <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                  <table className="w-full text-left text-xs min-w-[540px]">
                    <thead className="bg-[#0c0f17] text-slate-400 border-b border-white/[0.08]">
                      <tr>
                        <th className="p-2.5">Title</th>
                        <th className="p-2.5">Game</th>
                        <th className="p-2.5">Platform</th>
                        <th className="p-2.5">Format</th>
                        <th className="p-2.5">Views</th>
                        <th className="p-2.5">Likes</th>
                        <th className="p-2.5">Shares</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] bg-[#11141e]">
                      {previewVideos.slice(0, 4).map((v) => (
                        <tr key={v.id} className="text-slate-300">
                          <td className="p-2.5 font-medium text-white max-w-[200px] truncate">{v.title}</td>
                          <td className="p-2.5">{v.game}</td>
                          <td className="p-2.5">{v.platform === 'youtube_shorts' ? 'YT Shorts' : 'IG Reels'}</td>
                          <td className="p-2.5">{v.content_format}</td>
                          <td className="p-2.5 text-purple-400 font-semibold">{v.views.toLocaleString()}</td>
                          <td className="p-2.5">{v.likes !== null ? v.likes.toLocaleString() : '—'}</td>
                          <td className="p-2.5">{v.shares !== null ? v.shares.toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-white/[0.08] bg-[#0c0f17] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {previewVideos.length > 0 && `${previewVideos.length} videos ready to import`}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-center text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              disabled={previewVideos.length === 0}
              onClick={handleConfirmImport}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Import {previewVideos.length} Videos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
