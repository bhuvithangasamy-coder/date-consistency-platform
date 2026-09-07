import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Edit2, Trash2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { ruleService } from '../services/api';
import { ValidationRule } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

export const RuleManagementPage: React.FC = () => {
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await ruleService.getRules();
      setRules(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleStatus = async (rule: ValidationRule) => {
    const newStatus = rule.status === 'Active' ? 'Disabled' : 'Active';
    try {
      await ruleService.updateRule(rule.id, { status: newStatus });
      fetchRules();
    } catch (e) {
      alert('Error updating rule: ' + e);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Validation Rule Management</h2>
          <p className="text-xs text-slate-400">Configure reusable chronological validation rules and severity thresholds</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Rule ID</th>
                  <th className="p-3">Rule Name & Description</th>
                  <th className="p-3">Source Table & Expression</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-400">{rule.rule_code}</td>
                    <td className="p-3">
                      <div className="font-bold text-white">{rule.name}</div>
                      <div className="text-[11px] text-slate-400">{rule.description}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <span className="text-teal-400 font-semibold">{rule.source_table}</span>
                      <span className="text-slate-500 block">
                        {rule.left_field} {rule.operator} {rule.right_field || ''}
                      </span>
                    </td>
                    <td className="p-3">
                      <SeverityBadge severity={rule.severity} />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(rule)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                          rule.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {rule.status}
                      </button>
                    </td>
                    <td className="p-3 font-mono text-purple-400 font-bold">{rule.version}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(rule)}
                        className="text-xs text-sky-400 hover:underline font-semibold"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
