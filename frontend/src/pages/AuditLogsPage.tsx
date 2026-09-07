import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Clock, User as UserIcon, RefreshCw } from 'lucide-react';
import { auditService } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.getAuditLogs(100);
      setLogs(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Validation Audit Logs</h2>
          <p className="text-xs text-slate-400">Complete immutable audit trail of validation runs, user actions, & system operations</p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Trail</span>
        </button>
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
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity Target</th>
                  <th className="p-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 text-sky-400 font-bold">#{log.id}</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-teal-400 font-semibold text-[11px]">
                        {log.username}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{log.action}</td>
                    <td className="p-3 text-purple-400">{log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}</td>
                    <td className="p-3 text-slate-300 font-sans text-[11px]">{log.details}</td>
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
