/**
 * Centralized API Client Service (Vanilla JS Fetch API)
 */
const API_BASE_URL = '/api';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 401) {
      // Automatic login token fallback handling
      console.warn('Authentication token refreshed or unauthenticated request.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}

const api = {
  // Auth
  login: (username, password) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  getMe: () => apiFetch('/auth/me'),

  // Dashboard
  getDashboardSummary: (datasetId) => apiFetch(`/dashboard/summary${datasetId ? `?dataset_id=${datasetId}` : ''}`),

  // Datasets
  getDatasets: () => apiFetch('/datasets'),
  getDatasetById: (id) => apiFetch(`/datasets/${id}`),
  importKaggleDataset: (kaggleUrl) => apiFetch('/datasets/import', {
    method: 'POST',
    body: JSON.stringify({ kaggle_url: kaggleUrl })
  }),
  previewTable: (datasetId, tableName, limit = 50) => apiFetch(`/datasets/${datasetId}/tables/${tableName}/preview?limit=${limit}`),

  // Validation Engine
  triggerValidationRun: (datasetId) => apiFetch(`/validation/run?dataset_id=${datasetId}`, { method: 'POST' }),
  getValidationRuns: (datasetId) => apiFetch(`/validation/runs${datasetId ? `?dataset_id=${datasetId}` : ''}`),
  getRunMetrics: (runId) => apiFetch(`/validation/runs/${runId}/metrics`),

  // Anomalies
  getAnomalies: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/anomalies?${query}`);
  },
  getAnomalyById: (id) => apiFetch(`/anomalies/${id}`),
  getExportCsvUrl: (runId, severity, anomalyType) => {
    const query = new URLSearchParams();
    if (runId) query.append('run_id', runId);
    if (severity) query.append('severity', severity);
    if (anomalyType) query.append('anomaly_type', anomalyType);
    return `/api/anomalies/export/csv?${query.toString()}`;
  },

  // Timeline
  getPatientTimeline: (subjectId) => apiFetch(`/timeline/${subjectId}`),

  // Rules
  getRules: () => apiFetch('/rules'),
  createRule: (ruleData) => apiFetch('/rules', { method: 'POST', body: JSON.stringify(ruleData) }),
  updateRule: (id, updates) => apiFetch(`/rules/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteRule: (id) => apiFetch(`/rules/${id}`, { method: 'DELETE' }),

  // Onboarding
  onboardDataset: (payload) => apiFetch('/onboarding/onboard', { method: 'POST', body: JSON.stringify(payload) }),

  // Audit Logs & Settings
  getAuditLogs: (limit = 100) => apiFetch(`/audit-logs?limit=${limit}`),
  getSettings: () => apiFetch('/settings')
};
