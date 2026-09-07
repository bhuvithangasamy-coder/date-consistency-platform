import React, { useState } from 'react';
import { Play, CheckCircle2, AlertTriangle, Layers, Sliders, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validationService } from '../services/api';
import { ValidationRun } from '../types';

export const DateValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const datasetId = location.state?.datasetId || 1;

  const [validating, setValidating] = useState(false);
  const [lastRun, setLastRun] = useState<ValidationRun | null>(null);

  const handleStartValidation = async () => {
    setValidating(true);
    try {
      const res = await validationService.triggerRun(datasetId);
      setLastRun(res);
    } catch (e: any) {
      alert('Validation Engine Error: ' + (e.response?.data?.detail || e.message));
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Date Validation Engine</h2>
          <p className="text-xs text-slate-400">Trigger distributed PySpark date consistency rules across MIMIC-IV</p>
        </div>

        <button
          onClick={handleStartValidation}
          disabled={validating}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{validating ? 'Running PySpark Validation Engine...' : 'Run Date Validation Engine'}</span>
        </button>
      </div>

      {lastRun && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Validation Run Completed ({lastRun.run_number})</span>
            </h3>
            <button
              onClick={() => navigate('/anomalies', { state: { runId: lastRun.id } })}
              className="px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-500 transition-all"
            >
              View Anomaly Report
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Total Records</span>
              <span className="text-lg font-bold text-white">{lastRun.total_records.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Valid Records</span>
              <span className="text-lg font-bold text-emerald-400">{lastRun.valid_records.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Anomalies Flagged</span>
              <span className="text-lg font-bold text-rose-400">{lastRun.records_with_anomalies.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">Quality Score</span>
              <span className="text-lg font-bold text-sky-400">{lastRun.quality_score}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
