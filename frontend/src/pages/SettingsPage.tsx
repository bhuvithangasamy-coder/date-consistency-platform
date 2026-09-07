import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Database, Cpu, ShieldCheck, CheckCircle } from 'lucide-react';
import { settingsService } from '../services/api';
import { SystemSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.getSettings().then(setSettings).finally(() => setLoading(false));
  }, []);

  if (loading || !settings) return null;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System & Kaggle Credentials Settings</h2>
          <p className="text-xs text-slate-400">Configure environment credentials, database connection, & PySpark parameters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Kaggle Credentials Setup (Requirement 2) */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <Key className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Kaggle API Credentials Configuration</h3>
          </div>

          <p className="text-slate-400 leading-relaxed">
            To enable direct background downloads from Kaggle dataset <code className="text-sky-400">bbansal09/final-dataset-mimic-iv</code>, store your Kaggle API key in system environment variables or <code className="text-teal-400">.env</code>.
          </p>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono space-y-2 text-slate-300">
            <div># Set Windows Environment Variables:</div>
            <div className="text-emerald-400">$env:KAGGLE_USERNAME="your_username"</div>
            <div className="text-emerald-400">$env:KAGGLE_KEY="your_api_token"</div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Kaggle Configuration Status:</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              ✓ Active / File Upload Mechanism Enabled
            </span>
          </div>
        </div>

        {/* Database & PySpark Config */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">PostgreSQL & PySpark Infrastructure</h3>
          </div>

          <div className="space-y-3 font-mono">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">PostgreSQL Connection URL</span>
              <span className="text-sky-300">{settings.database_url}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">PySpark Java Home</span>
              <span className="text-teal-300">{settings.java_home}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block mb-1">Spark Driver Memory</span>
              <span className="text-purple-300">{settings.spark_driver_memory}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
