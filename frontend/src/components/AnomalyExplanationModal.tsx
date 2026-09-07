import React from 'react';
import { X, AlertTriangle, CheckCircle, HelpCircle, FileText, ArrowRight } from 'lucide-react';
import { Anomaly } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface AnomalyExplanationModalProps {
  anomaly: Anomaly | null;
  onClose: () => void;
}

export const AnomalyExplanationModal: React.FC<AnomalyExplanationModalProps> = ({ anomaly, onClose }) => {
  if (!anomaly) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-sky-400">{anomaly.rule_code}</span>
              <SeverityBadge severity={anomaly.severity} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {anomaly.rule_name}
            </h3>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Target Table & Column</span>
            <span className="font-mono font-semibold text-slate-200">{anomaly.table_name}.{anomaly.column_name}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Subject / Hadm ID</span>
            <span className="font-mono font-semibold text-teal-400">
              {anomaly.subject_id ? `Patient #${anomaly.subject_id}` : 'N/A'} {anomaly.hadm_id ? `(HADM ${anomaly.hadm_id})` : ''}
            </span>
          </div>
        </div>

        {/* Rule Explanation Block */}
        <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800/90">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Expected Condition</span>
            </div>
            <p className="text-xs font-mono text-slate-300 pl-6 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              {anomaly.expected_condition}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Actual Detected Condition</span>
            </div>
            <p className="text-xs font-mono text-rose-300 pl-6 bg-rose-950/20 p-2 rounded-lg border border-rose-900/40">
              {anomaly.actual_condition}
            </p>
          </div>

          {anomaly.original_value && (
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/60 font-mono">
              <span className="text-slate-400">Original Value: <strong className="text-amber-300">{anomaly.original_value}</strong></span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400">Standardized: <strong className="text-sky-300">{anomaly.standardized_value || anomaly.original_value}</strong></span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition-all"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
