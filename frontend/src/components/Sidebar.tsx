import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  Sliders,
  FolderPlus,
  FileText,
  Settings
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Dataset Management', path: '/datasets', icon: Database },
  { name: 'Data Preview', path: '/preview', icon: Eye },
  { name: 'Processing Monitor', path: '/monitor', icon: Activity },
  { name: 'Date Validation', path: '/validation', icon: CheckCircle2 },
  { name: 'Anomaly Report', path: '/anomalies', icon: AlertTriangle },
  { name: 'Record Timeline', path: '/timeline', icon: GitCommit },
  { name: 'Rule Management', path: '/rules', icon: Sliders },
  { name: 'Dataset Onboarding', path: '/onboarding', icon: FolderPlus },
  { name: 'Audit Logs', path: '/audit-logs', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0b1329] border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Platform Navigation
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/10 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Engine Version</span>
            <span className="text-teal-400 font-mono font-semibold">v2.0.0</span>
          </div>
          <div className="text-[11px] text-slate-500">
            PySpark Distributed Validator
          </div>
        </div>
      </div>
    </aside>
  );
};
