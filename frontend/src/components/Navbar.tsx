import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, User, LogOut, Activity, Clock, Layers } from 'lucide-react';
import { authService } from '../services/api';

interface NavbarProps {
  userRole?: string;
  username?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole = 'Analyst', username = 'analyst', onLogout }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#0f172a]/95 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Brand & Data Source Badge */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Activity className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-none">
              Date Consistency Platform
            </h1>
            <span className="text-xs text-sky-400 font-medium">
              MIMIC-IV Clinical Quality Engine
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-medium text-slate-400">Data Source:</span>
          <span className="font-semibold text-sky-400">Kaggle MIMIC-IV Clinical DB</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
        </div>
      </div>

      {/* Right Header Status & Profile */}
      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono">{currentTime || '14:00:00'}</span>
          <span className="text-slate-600">|</span>
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>PySpark 4.2 Engine</span>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">{username}</div>
              <div className="text-[10px] text-sky-400 font-medium">{userRole}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
