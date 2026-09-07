import React, { useState, useEffect } from 'react';
import { Eye, Table as TableIcon, RefreshCw, Database, FileText } from 'lucide-react';
import { datasetService } from '../services/api';

export const DataPreviewPage: React.FC = () => {
  const [tables] = useState<string[]>(['admissions', 'patients', 'transfers', 'labevents', 'prescriptions', 'icustays', 'chartevents']);
  const [selectedTable, setSelectedTable] = useState<string>('admissions');
  const [previewData, setPreviewData] = useState<{ columns: string[]; records: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPreview = async (tbl: string) => {
    setLoading(true);
    try {
      const res = await datasetService.previewTable(1, tbl, 50);
      setPreviewData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview(selectedTable);
  }, [selectedTable]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Data Preview & Schema Inspector</h2>
          <p className="text-xs text-slate-400">Inspect raw clinical dataset structure and timestamp fields</p>
        </div>

        {/* Table Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <TableIcon className="w-4 h-4 text-sky-400" />
          <span className="text-slate-400 font-medium">Select Table:</span>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer font-bold"
          >
            {tables.map((t) => (
              <option key={t} value={t} className="bg-slate-900 text-white">{t}.csv</option>
            ))}
          </select>
        </div>
      </div>

      {loading || !previewData ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
              Table: {selectedTable}.csv ({previewData.columns.length} columns)
            </span>
            <span className="text-xs text-slate-500 font-mono">Showing first 50 records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  {previewData.columns.map((col) => (
                    <th key={col} className={`p-3 font-bold ${col.includes('time') || col.includes('date') ? 'text-teal-400 bg-teal-950/20' : ''}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                {previewData.records.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                    {previewData.columns.map((col) => (
                      <td key={col} className={`p-3 whitespace-nowrap ${col.includes('time') || col.includes('date') ? 'text-sky-300 font-semibold' : ''}`}>
                        {String(row[col])}
                      </td>
                    ))}
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
