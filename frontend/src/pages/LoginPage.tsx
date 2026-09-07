import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { authService } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('analyst123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20 mb-4">
            <Activity className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Date Consistency Platform
          </h2>
          <p className="text-xs text-sky-400 font-medium">
            Clinical Data Quality & Validation Solution
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Preset Quick Login Pills */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Demo Accounts (Click to select)</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-sky-400 font-medium"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setUsername('analyst'); setPassword('analyst123'); }}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-teal-400 font-medium"
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => { setUsername('viewer'); setPassword('viewer123'); }}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-purple-400 font-medium"
              >
                Viewer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:opacity-95 transition-all flex items-center justify-center space-x-2 mt-4"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
