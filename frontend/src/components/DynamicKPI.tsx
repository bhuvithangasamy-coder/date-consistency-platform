import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DynamicKPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string; // Tailwind gradient string
  iconColor: string;
  trend?: string;
  positive?: boolean;
}

export const DynamicKPI: React.FC<DynamicKPIProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  trend,
  positive = true
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-800 p-5 bg-slate-900/90 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-slate-700`}>
      {/* Background Subtle Glow */}
      <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full blur-2xl opacity-20 ${gradient}`} />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-slate-500 font-medium">
          {subtitle}
        </div>
      )}
    </div>
  );
};
