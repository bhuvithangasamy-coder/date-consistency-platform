export type UserRole = 'Admin' | 'Analyst' | 'Viewer';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface DatasetTable {
  id: number;
  table_name: string;
  record_count: number;
  column_count: number;
  date_columns: string[];
  schema_info: Record<string, any>;
}

export interface Dataset {
  id: number;
  name: string;
  source_type: string;
  version: string;
  record_count: number;
  table_count: number;
  status: string;
  storage_path: string;
  created_at: string;
  last_validated_at?: string;
  tables: DatasetTable[];
}

export interface ValidationRule {
  id: number;
  rule_code: string;
  name: string;
  description?: string;
  source_table: string;
  left_field: string;
  operator: string;
  right_field?: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Disabled';
  version: string;
  created_at: string;
}

export interface ValidationRun {
  id: number;
  dataset_id: number;
  run_number: string;
  user_id?: number;
  total_records: number;
  valid_records: number;
  records_with_anomalies: number;
  total_violations: number;
  missing_timestamps: number;
  invalid_durations: number;
  sequence_violations: number;
  future_timestamps: number;
  invalid_timestamps: number;
  quality_score: number;
  status: string;
  started_at: string;
  completed_at?: string;
  duration_seconds: number;
}

export interface Anomaly {
  id: number;
  validation_run_id: number;
  subject_id?: string;
  hadm_id?: string;
  record_id?: string;
  table_name: string;
  column_name: string;
  rule_code: string;
  rule_name: string;
  original_value?: string;
  standardized_value?: string;
  expected_condition: string;
  actual_condition: string;
  anomaly_type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  detected_at: string;
}

export interface AnomalyPaginatedResponse {
  total: number;
  page: number;
  limit: number;
  anomalies: Anomaly[];
}

export interface TimelineEvent {
  event_id: string;
  event_name: string;
  table_name: string;
  timestamp: string;
  original_value: string;
  standardized_value: string;
  sequence_order: number;
  status: 'Valid' | 'Warning' | 'Invalid';
  rule_applied?: string;
  anomaly_explanation?: string;
}

export interface PatientTimeline {
  subject_id: string;
  hadm_id?: string;
  total_events: number;
  has_anomalies: boolean;
  events: TimelineEvent[];
}

export interface DashboardSummary {
  dataset_name: string;
  dataset_source: string;
  dataset_version: string;
  total_records_processed: number;
  valid_records: number;
  records_with_anomalies: number;
  total_date_violations: number;
  missing_timestamps: number;
  invalid_durations: number;
  sequence_violations: number;
  future_timestamps: number;
  invalid_timestamps: number;
  data_quality_score: number;
  quality_status: 'Excellent' | 'Good' | 'Needs Attention' | 'Poor';
  last_validation_time?: string;
  severity_distribution: Record<string, number>;
  rule_violation_distribution: { rule_code: string; name: string; count: number }[];
  processing_volume_history: { run_number: string; total_records: number; duration: number }[];
  quality_trend: { run_number: string; quality_score: number; date?: string }[];
}

export interface AuditLog {
  id: number;
  user_id?: number;
  username: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  timestamp: string;
}

export interface SystemSettings {
  project_name: string;
  kaggle_dataset: string;
  kaggle_configured: boolean;
  database_url: string;
  java_home: string;
  spark_driver_memory: string;
  environment: string;
  live_clinical_datasource_connected: boolean;
}
