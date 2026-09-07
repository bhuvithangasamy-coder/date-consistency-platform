import axios from 'axios';
import {
  DashboardSummary,
  Dataset,
  ValidationRun,
  AnomalyPaginatedResponse,
  Anomaly,
  PatientTimeline,
  ValidationRule,
  AuditLog,
  SystemSettings,
  User
} from '../types';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const dashboardService = {
  getSummary: async (datasetId?: number): Promise<DashboardSummary> => {
    const res = await api.get('/dashboard/summary', { params: { dataset_id: datasetId } });
    return res.data;
  }
};

export const datasetService = {
  getDatasets: async (): Promise<Dataset[]> => {
    const res = await api.get('/datasets');
    return res.data;
  },
  getDatasetById: async (id: number): Promise<Dataset> => {
    const res = await api.get(`/datasets/${id}`);
    return res.data;
  },
  importKaggleDataset: async (kaggleUrl?: string): Promise<Dataset> => {
    const res = await api.post('/datasets/import', { kaggle_url: kaggleUrl });
    return res.data;
  },
  uploadDataset: async (formData: FormData): Promise<Dataset> => {
    const res = await api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  previewTable: async (datasetId: number, tableName: string, limit = 50) => {
    const res = await api.get(`/datasets/${datasetId}/tables/${tableName}/preview`, { params: { limit } });
    return res.data;
  }
};

export const validationService = {
  triggerRun: async (datasetId: number): Promise<ValidationRun> => {
    const res = await api.post('/validation/run', null, { params: { dataset_id: datasetId } });
    return res.data;
  },
  getRuns: async (datasetId?: number): Promise<ValidationRun[]> => {
    const res = await api.get('/validation/runs', { params: { dataset_id: datasetId } });
    return res.data;
  },
  getRunMetrics: async (runId: number) => {
    const res = await api.get(`/validation/runs/${runId}/metrics`);
    return res.data;
  }
};

export const anomalyService = {
  getAnomalies: async (params: {
    run_id?: number;
    subject_id?: string;
    table_name?: string;
    rule_code?: string;
    severity?: string;
    anomaly_type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AnomalyPaginatedResponse> => {
    const res = await api.get('/anomalies', { params });
    return res.data;
  },
  getAnomalyById: async (id: number): Promise<Anomaly> => {
    const res = await api.get(`/anomalies/${id}`);
    return res.data;
  },
  getExportUrl: (runId?: number, severity?: string, anomalyType?: string) => {
    const searchParams = new URLSearchParams();
    if (runId) searchParams.append('run_id', runId.toString());
    if (severity) searchParams.append('severity', severity);
    if (anomalyType) searchParams.append('anomaly_type', anomalyType);
    return `/api/anomalies/export/csv?${searchParams.toString()}`;
  }
};

export const timelineService = {
  getPatientTimeline: async (subjectId: string): Promise<PatientTimeline> => {
    const res = await api.get(`/timeline/${subjectId}`);
    return res.data;
  }
};

export const ruleService = {
  getRules: async (): Promise<ValidationRule[]> => {
    const res = await api.get('/rules');
    return res.data;
  },
  createRule: async (rule: Partial<ValidationRule>): Promise<ValidationRule> => {
    const res = await api.post('/rules', rule);
    return res.data;
  },
  updateRule: async (id: number, updates: Partial<ValidationRule>): Promise<ValidationRule> => {
    const res = await api.put(`/rules/${id}`, updates);
    return res.data;
  },
  deleteRule: async (id: number) => {
    const res = await api.delete(`/rules/${id}`);
    return res.data;
  }
};

export const onboardingService = {
  onboardDataset: async (payload: any): Promise<Dataset> => {
    const res = await api.post('/onboarding/onboard', payload);
    return res.data;
  }
};

export const auditService = {
  getAuditLogs: async (limit = 100): Promise<AuditLog[]> => {
    const res = await api.get('/audit-logs', { params: { limit } });
    return res.data;
  }
};

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    const res = await api.get('/settings');
    return res.data;
  }
};
