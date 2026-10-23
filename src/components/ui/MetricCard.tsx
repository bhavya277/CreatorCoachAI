import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-purple-400',
  trend,
  className = '',
}: MetricCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#0f121d] border border-white/[0.08] p-3.5 sm:p-5 shadow-xl hover:border-purple-500/30 transition-all duration-300 group ${className}`}
    >
      {/* Corner subtle ambient lighting */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />

      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
          {title}
        </span>
        <div className={`p-1.5 sm:p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] ${iconColor} group-hover:scale-105 transition-transform shrink-0`}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate">
          {value}
        </span>
        {trend && (
          <span
            className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-400 line-clamp-1">{subtitle}</p>
      )}
    </div>
  );
}
