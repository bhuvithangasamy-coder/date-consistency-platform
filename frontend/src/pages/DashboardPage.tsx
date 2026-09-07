import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Zap,
  Layers,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { dashboardService } from '../services/api';
import { DashboardSummary } from '../types';
import { DynamicKPI } from '../components/DynamicKPI';
import { CircularProgress } from '../components/CircularProgress';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [anomalyTypeFilter, setAnomalyTypeFilter] = useState<string>('All');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (e) {
      console.error('Failed to load dashboard summary', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Computing dynamic MIMIC-IV clinical metrics...</span>
        </div>
      </div>
    );
  }

  // Severity Distribution for Pie / Bar
  const severityData = [
    { name: 'Critical', value: summary.severity_distribution.Critical || 0, color: '#f43f5e' },
    { name: 'High', value: summary.severity_distribution.High || 0, color: '#f59e0b' },
    { name: 'Medium', value: summary.severity_distribution.Medium || 0, color: '#eab308' },
    { name: 'Low', value: summary.severity_distribution.Low || 0, color: '#38bdf8' }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-teal-400" />
            <span>{summary.dataset_name} ({summary.dataset_version})</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Date Consistency Dashboard
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Severity Filter */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <button
            onClick={fetchSummary}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {/* Top Section: Quality Score Gauge + Dynamic KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Data Quality Score Circular Indicator */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Data Quality Score
          </div>
          <CircularProgress score={summary.data_quality_score} status={summary.quality_status} size={150} />
          <div className="mt-4 text-center text-xs text-slate-400 max-w-[200px]">
            Formula: <span className="font-mono text-sky-400 font-semibold">100 × Valid / Total</span>
          </div>
        </div>

        {/* Dynamic KPI Cards (3 columns) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <DynamicKPI
            title="Total Records Processed"
            value={summary.total_records_processed}
            subtitle="MIMIC-IV Multi-Table Dataset"
            icon={Layers}
            gradient="from-sky-500 to-indigo-500"
            iconColor="text-sky-400"
            trend="1.1M+ Active"
            positive={true}
          />
          <DynamicKPI
            title="Valid Records"
            value={summary.valid_records}
            subtitle="Passing Chronology Rules"
            icon={CheckCircle2}
            gradient="from-emerald-500 to-teal-500"
            iconColor="text-emerald-400"
            trend={`${((summary.valid_records / summary.total_records_processed) * 100).toFixed(1)}% Passed`}
            positive={true}
          />
          <DynamicKPI
            title="Records With Anomalies"
            value={summary.records_with_anomalies}
            subtitle="Flagged Date Inconsistencies"
            icon={AlertTriangle}
            gradient="from-rose-500 to-amber-500"
            iconColor="text-rose-400"
            trend="Requires Review"
            positive={false}
          />
          <DynamicKPI
            title="Sequence Violations"
            value={summary.sequence_violations}
            subtitle="Out-of-order Chronology"
            icon={Activity}
            gradient="from-amber-500 to-orange-500"
            iconColor="text-amber-400"
          />
          <DynamicKPI
            title="Invalid Durations"
            value={summary.invalid_durations}
            subtitle="End Date < Start Date"
            icon={Clock}
            gradient="from-purple-500 to-indigo-500"
            iconColor="text-purple-400"
          />
          <DynamicKPI
            title="Future & Missing Timestamps"
            value={summary.future_timestamps + summary.missing_timestamps}
            subtitle="Future relative to ref / Null"
            icon={Zap}
            gradient="from-pink-500 to-rose-500"
            iconColor="text-rose-400"
          />
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Violation Distribution Bar Chart */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Rule Violation Distribution</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">By Rule Code</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.rule_violation_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="rule_code" stroke="#64748b" fontSize={11} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]}>
                  {summary.rule_violation_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#38bdf8' : '#14b8a6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Trend Area Chart */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Data Quality Score Trend</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Validation Runs</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.quality_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="qualityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="run_number" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="quality_score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#qualityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
