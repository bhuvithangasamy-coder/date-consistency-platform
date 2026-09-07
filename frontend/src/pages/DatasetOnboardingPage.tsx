import React, { useState } from 'react';
import { FolderPlus, CheckCircle, ArrowRight, Upload, Layers, Sliders, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onboardingService } from '../services/api';

export const DatasetOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [datasetName, setDatasetName] = useState('External EMR Dataset');
  const [loading, setLoading] = useState(false);

  const handleOnboardSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        dataset_name: datasetName,
        source_type: 'External Clinical Upload',
        tables: [
          { table_name: 'external_admissions', record_count: 50000, columns: ['subject_id', 'admittime', 'dischtime'], date_columns: ['admittime', 'dischtime'] },
          { table_name: 'external_labs', record_count: 200000, columns: ['subject_id', 'charttime', 'valuenum'], date_columns: ['charttime'] }
        ],
        event_mappings: [
          { entity_id: 'subject_id', event_name: 'External Admission', table_name: 'external_admissions', timestamp_column: 'admittime' },
          { entity_id: 'subject_id', event_name: 'External Discharge', table_name: 'external_admissions', timestamp_column: 'dischtime' }
        ],
        validation_rules: []
      };

      const ds = await onboardingService.onboardDataset(payload);
      alert(`Dataset '${ds.name}' onboarded successfully! Zero code changes required.`);
      navigate('/datasets');
    } catch (e) {
      alert('Onboarding error: ' + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Onboard New External Dataset</h2>
          <p className="text-xs text-slate-400">Zero-code configuration workflow for mapping new clinical dataset schemas</p>
        </div>
      </div>

      {/* Stepper Workflow Visual */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs font-semibold">
          {['1. Schema Detection', '2. Date Column Mapping', '3. Event Sequence Mapping', '4. Rule Activation'].map((label, idx) => (
            <div key={label} className={`flex items-center space-x-2 ${step === idx + 1 ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step === idx + 1 ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                {idx + 1}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider">New Dataset Name</label>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm">Automatic Schema & Date Column Detection</h4>
            <p className="text-slate-400">
              The engine automatically inspects uploaded CSV / Parquet headers, detects timestamp representations, and builds configurable event sequences without requiring core code changes.
            </p>
          </div>

          <button
            onClick={handleOnboardSubmit}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:opacity-95 transition-all"
          >
            <span>{loading ? 'Registering Configuration...' : 'Complete Onboarding & Run Validation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
