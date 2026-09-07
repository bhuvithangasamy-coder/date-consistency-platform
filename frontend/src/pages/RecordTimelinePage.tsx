import React, { useState, useEffect } from 'react';
import { GitCommit, CheckCircle2, AlertTriangle, XCircle, Search, RefreshCw, Clock, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { timelineService } from '../services/api';
import { PatientTimeline, TimelineEvent } from '../types';

export const RecordTimelinePage: React.FC = () => {
  const location = useLocation();
  const initialSubject = location.state?.subjectId || '10000001';

  const [subjectId, setSubjectId] = useState(initialSubject);
  const [timeline, setTimeline] = useState<PatientTimeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const fetchTimeline = async (id: string) => {
    setLoading(true);
    try {
      const res = await timelineService.getPatientTimeline(id);
      setTimeline(res);
      if (res.events.length > 0) setSelectedEvent(res.events[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline(subjectId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTimeline(subjectId);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Patient Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Clinical Event Timeline</h2>
          <p className="text-xs text-slate-400">Interactive chronological patient event timeline visualization</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="Enter Subject ID (e.g. 10000001)"
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/20">
            Load Patient
          </button>
        </form>
      </div>

      {loading || !timeline ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chronological Event Tree (Left 2 cols) */}
          <div className="lg:col-span-2 bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                Patient #{timeline.subject_id} ({timeline.total_events} Chronological Events)
              </span>
              {timeline.has_anomalies ? (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold">
                  ⚠️ Chronology Anomalies Detected
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                  ✅ Valid Chronology
                </span>
              )}
            </div>

            {/* Vertical Timeline Tree */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {timeline.events.map((evt, idx) => {
                let badgeIcon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
                let badgeBg = 'bg-emerald-950/40 border-emerald-500/40';

                if (evt.status === 'Warning') {
                  badgeIcon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
                  badgeBg = 'bg-amber-950/40 border-amber-500/40';
                } else if (evt.status === 'Invalid') {
                  badgeIcon = <XCircle className="w-5 h-5 text-rose-500" />;
                  badgeBg = 'bg-rose-950/40 border-rose-500/40';
                }

                const isSelected = selectedEvent?.event_id === evt.event_id;

                return (
                  <div
                    key={evt.event_id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`relative cursor-pointer group transition-all p-4 rounded-xl border ${
                      isSelected
                        ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-950/50 scale-[1.01]'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Node Dot Icon */}
                    <div className={`absolute -left-9 top-4 w-7 h-7 rounded-full border-2 flex items-center justify-center bg-slate-950 ${badgeBg}`}>
                      {badgeIcon}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white tracking-tight">{evt.event_name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {evt.table_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-mono text-sky-400 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{evt.standardized_value}</span>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${isSelected ? 'rotate-90 text-sky-400' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Inspector Panel (Right col) */}
          <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white tracking-tight border-b border-slate-800 pb-3">
              Event Inspector Details
            </h3>

            {selectedEvent ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Event Name</span>
                  <span className="text-sm font-bold text-white">{selectedEvent.event_name}</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block">Original Timestamp</span>
                  <span className="font-mono font-semibold text-amber-300">{selectedEvent.original_value}</span>
                  <span className="text-slate-500 block pt-1">Standardized Timestamp (ISO 8601)</span>
                  <span className="font-mono font-semibold text-sky-400">{selectedEvent.standardized_value}</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Rule Applied</span>
                  <span className="font-mono font-bold text-purple-400">{selectedEvent.rule_applied || 'N/A'}</span>
                </div>

                {selectedEvent.anomaly_explanation && (
                  <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-900/40 space-y-1">
                    <span className="text-rose-400 font-bold block">Anomaly Explanation</span>
                    <p className="text-xs text-rose-300 font-mono">{selectedEvent.anomaly_explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-500">Click any event on the timeline tree to inspect details.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
