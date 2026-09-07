import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, Eye, Play, CheckCircle, RefreshCw, Table as TableIcon, Calendar, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { datasetService, validationService } from '../services/api';
import { Dataset } from '../types';

export const DatasetManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const list = await datasetService.getDatasets();
      setDatasets(list);
      if (list.length > 0) setSelectedDataset(list[0]);
    } catch (e) {
      console.error('Failed to load datasets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleImportKaggle = async () => {
    setImporting(true);
    try {
      const res = await datasetService.importKaggleDataset();
      await loadDatasets();
    } catch (e) {
      alert('Kaggle import error: ' + e);
    } finally {
      setImporting(false);
    }
  };

  const handleRunValidation = async (id: number) => {
    navigate('/validation', { state: { datasetId: id } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Dataset Management</h2>
          <p className="text-xs text-slate-400">Manage real-world Kaggle MIMIC-IV clinical datasets & custom uploads</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleImportKaggle}
            disabled={importing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:opacity-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{importing ? 'Importing Kaggle...' : 'Import Kaggle MIMIC-IV'}</span>
          </button>
        </div>
      </div>

      {/* Dataset List Cards */}
      <div className="grid grid-cols-1 gap-6">
        {datasets.map((ds) => (
          <div key={ds.id} className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{ds.name}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                    <span>Source: <strong className="text-sky-400">{ds.source_type}</strong></span>
                    <span>•</span>
                    <span>Version: <strong className="text-purple-400">{ds.version}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-emerald-400">{ds.status}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/preview', { state: { datasetId: ds.id } })}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Preview Data</span>
                </button>
                <button
                  onClick={() => handleRunValidation(ds.id)}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Validate Dataset</span>
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Total Records Processed</span>
                <span className="text-lg font-extrabold text-white">{ds.record_count.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Clinical Tables</span>
                <span className="text-lg font-extrabold text-sky-400">{ds.table_count} Tables</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Storage Location</span>
                <span className="font-mono text-slate-300 truncate block" title={ds.storage_path}>{ds.storage_path}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Last Validated</span>
                <span className="font-mono text-teal-400">{ds.last_validated_at ? new Date(ds.last_validated_at).toLocaleString() : 'Just Now'}</span>
              </div>
            </div>

            {/* Table Details List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <TableIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Detected Clinical Tables & Date Columns</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ds.tables.map((tbl) => (
                  <div key={tbl.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{tbl.table_name}.csv</span>
                      <span className="text-slate-400 text-[11px]">{tbl.record_count.toLocaleString()} rows</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] text-sky-400 font-mono">
                      <span>Date Cols:</span>
                      <span>{tbl.date_columns.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
