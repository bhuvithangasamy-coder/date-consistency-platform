import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download, Search, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { anomalyService } from '../services/api';
import { Anomaly, AnomalyPaginatedResponse } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { AnomalyExplanationModal } from '../components/AnomalyExplanationModal';

export const AnomalyReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AnomalyPaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [anomalyType, setAnomalyType] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await anomalyService.getAnomalies({
        search,
        severity: severity || undefined,
        anomaly_type: anomalyType || undefined,
        page,
        limit: 25
      });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [page, severity, anomalyType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnomalies();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Date Anomaly Report</h2>
          <p className="text-xs text-slate-400">Server-side paginated chronological inconsistency records</p>
        </div>

        <a
          href={anomalyService.getExportUrl(undefined, severity, anomalyType)}
          download
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Report (CSV)</span>
        </a>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Subject ID, Record ID, or Rule..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl">
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={anomalyType}
            onChange={(e) => { setAnomalyType(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white cursor-pointer"
          >
            <option value="">All Anomaly Types</option>
            <option value="Future Timestamp">Future Timestamp</option>
            <option value="Sequence Violation">Sequence Violation</option>
            <option value="Invalid Duration">Invalid Duration</option>
            <option value="Missing Timestamp">Missing Timestamp</option>
            <option value="Invalid Timestamp">Invalid Timestamp</option>
          </select>
        </div>
      </div>

      {/* Anomaly Table */}
      {loading || !data ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Record / Subject</th>
                  <th className="p-3">Table & Column</th>
                  <th className="p-3">Rule Code & Name</th>
                  <th className="p-3">Anomaly Type</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                {data.anomalies.map((anom) => (
                  <tr key={anom.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-sky-400">Patient #{anom.subject_id || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Rec ID: {anom.record_id}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-teal-400 font-semibold">{anom.table_name}</span>
                      <span className="text-slate-500 block text-[10px]">{anom.column_name}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-purple-400 font-bold">{anom.rule_code}</span>
                      <span className="text-slate-300 block text-[11px] font-sans">{anom.rule_name}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-semibold text-[11px]">
                        {anom.anomaly_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <SeverityBadge severity={anom.severity} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedAnomaly(anom)}
                          className="p-1.5 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="View Explanation"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/timeline`, { state: { subjectId: anom.subject_id } })}
                          className="px-2 py-1 bg-sky-950 text-sky-400 hover:bg-sky-900 rounded text-[10px] font-semibold border border-sky-800"
                        >
                          Timeline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
            <span>Showing page {data.page} of {Math.ceil(data.total / data.limit)} ({data.total.toLocaleString()} total anomalies)</span>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-50 text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-white bg-slate-900 border border-slate-800 rounded-xl">{page}</span>
              <button
                disabled={page * data.limit >= data.total}
                onClick={() => setPage(page + 1)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl disabled:opacity-50 text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Explanation Modal */}
      <AnomalyExplanationModal
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
      />
    </div>
  );
};
