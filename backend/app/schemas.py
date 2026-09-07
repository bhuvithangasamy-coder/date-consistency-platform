import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# Dataset Schemas
class DatasetTableResponse(BaseModel):
    id: int
    table_name: str
    record_count: int
    column_count: int
    date_columns: List[str]
    schema_info: Dict[str, Any]

    class Config:
        from_attributes = True

class DatasetResponse(BaseModel):
    id: int
    name: str
    source_type: str
    version: str
    record_count: int
    table_count: int
    status: str
    storage_path: str
    created_at: datetime.datetime
    last_validated_at: Optional[datetime.datetime] = None
    tables: List[DatasetTableResponse] = []

    class Config:
        from_attributes = True

class KaggleImportRequest(BaseModel):
    kaggle_url: Optional[str] = "https://www.kaggle.com/datasets/bbansal09/final-dataset-mimic-iv"
    kaggle_username: Optional[str] = None
    kaggle_key: Optional[str] = None

# Validation Rule Schemas
class RuleBase(BaseModel):
    rule_code: str
    name: str
    description: Optional[str] = None
    source_table: str
    left_field: str
    operator: str
    right_field: Optional[str] = None
    severity: str = "High"
    status: str = "Active"
    version: str = "v1.0"

class RuleCreate(RuleBase):
    pass

class RuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    left_field: Optional[str] = None
    operator: Optional[str] = None
    right_field: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    version: Optional[str] = None

class RuleResponse(RuleBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Validation Run Schemas
class ValidationRunResponse(BaseModel):
    id: int
    dataset_id: int
    run_number: str
    user_id: Optional[int] = None
    total_records: int
    valid_records: int
    records_with_anomalies: int
    total_violations: int
    missing_timestamps: int
    invalid_durations: int
    sequence_violations: int
    future_timestamps: int
    invalid_timestamps: int
    quality_score: float
    status: str
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    duration_seconds: float

    class Config:
        from_attributes = True

# Anomaly Schemas
class AnomalyResponse(BaseModel):
    id: int
    validation_run_id: int
    subject_id: Optional[str] = None
    hadm_id: Optional[str] = None
    record_id: Optional[str] = None
    table_name: str
    column_name: str
    rule_code: str
    rule_name: str
    original_value: Optional[str] = None
    standardized_value: Optional[str] = None
    expected_condition: str
    actual_condition: str
    anomaly_type: str
    severity: str
    status: str
    detected_at: datetime.datetime

    class Config:
        from_attributes = True

class AnomalyPaginatedResponse(BaseModel):
    total: int
    page: int
    limit: int
    anomalies: List[AnomalyResponse]

# Timeline Schemas
class TimelineEvent(BaseModel):
    event_id: str
    event_name: str
    table_name: str
    timestamp: str
    original_value: str
    standardized_value: str
    sequence_order: int
    status: str # Valid, Warning, Invalid
    rule_applied: Optional[str] = None
    anomaly_explanation: Optional[str] = None

class PatientTimelineResponse(BaseModel):
    subject_id: str
    hadm_id: Optional[str] = None
    total_events: int
    has_anomalies: bool
    events: List[TimelineEvent]

# Dashboard Summary Schemas
class DashboardSummary(BaseModel):
    dataset_name: str
    dataset_source: str
    dataset_version: str
    total_records_processed: int
    valid_records: int
    records_with_anomalies: int
    total_date_violations: int
    missing_timestamps: int
    invalid_durations: int
    sequence_violations: int
    future_timestamps: int
    invalid_timestamps: int
    data_quality_score: float
    quality_status: str # Excellent, Good, Needs Attention, Poor
    last_validation_time: Optional[datetime.datetime] = None
    severity_distribution: Dict[str, int]
    rule_violation_distribution: List[Dict[str, Any]]
    processing_volume_history: List[Dict[str, Any]]
    quality_trend: List[Dict[str, Any]]

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    username: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Onboarding Schema
class DatasetOnboardRequest(BaseModel):
    dataset_name: str
    source_type: str = "Uploaded Dataset"
    tables: List[Dict[str, Any]]
    event_mappings: List[Dict[str, Any]]
    validation_rules: List[RuleCreate]
