import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'sm' }) => {
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Info;

  switch (severity) {
    case 'Critical':
      badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      Icon = AlertOctagon;
      break;
    case 'High':
      badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      Icon = AlertTriangle;
      break;
    case 'Medium':
      badgeStyle = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      Icon = AlertCircle;
      break;
    case 'Low':
      badgeStyle = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      Icon = Info;
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center space-x-1.5 font-semibold rounded-md border ${padding} ${badgeStyle}`}>
      <Icon className={iconSize} />
      <span>{severity}</span>
    </span>
  );
};
