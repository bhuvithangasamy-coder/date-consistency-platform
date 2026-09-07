import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="Analyst", nullable=False)  # Admin, Analyst, Viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(100), nullable=False)
    source_type = Column(String(50), default="Kaggle MIMIC-IV")
    version = Column(String(20), default="v2.2")
    record_count = Column(Integer, default=0)
    table_count = Column(Integer, default=0)
    status = Column(String(30), default="Ready")  # Ready, Processing, Validating, Error
    storage_path = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_validated_at = Column(DateTime, nullable=True)

    tables = relationship("DatasetTable", back_populates="dataset", cascade="all, delete-orphan")
    validation_runs = relationship("ValidationRun", back_populates="dataset", cascade="all, delete-orphan")

class DatasetTable(Base):
    __tablename__ = "dataset_tables"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    table_name = Column(String(100), nullable=False)
    record_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    date_columns = Column(JSON, nullable=True)
    schema_info = Column(JSON, nullable=True)

    dataset = relationship("Dataset", back_populates="tables")

class ValidationRule(Base):
    __tablename__ = "validation_rules"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    rule_code = Column(String(20), unique=True, index=True, nullable=False) # e.g. RULE-001
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    source_table = Column(String(100), nullable=False)
    left_field = Column(String(100), nullable=False)
    operator = Column(String(20), nullable=False) # <=, >=, IS_NOT_NULL, NOT_FUTURE, etc.
    right_field = Column(String(100), nullable=True)
    severity = Column(String(20), default="High") # Critical, High, Medium, Low
    status = Column(String(20), default="Active") # Active, Disabled
    version = Column(String(10), default="v1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ValidationRun(Base):
    __tablename__ = "validation_runs"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    run_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_records = Column(Integer, default=0)
    valid_records = Column(Integer, default=0)
    records_with_anomalies = Column(Integer, default=0)
    total_violations = Column(Integer, default=0)
    missing_timestamps = Column(Integer, default=0)
    invalid_durations = Column(Integer, default=0)
    sequence_violations = Column(Integer, default=0)
    future_timestamps = Column(Integer, default=0)
    invalid_timestamps = Column(Integer, default=0)
    quality_score = Column(Float, default=100.0)
    status = Column(String(30), default="Completed") # Running, Completed, Failed
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, default=0.0)

    dataset = relationship("Dataset", back_populates="validation_runs")
    anomalies = relationship("Anomaly", back_populates="validation_run", cascade="all, delete-orphan")

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    validation_run_id = Column(Integer, ForeignKey("validation_runs.id"), nullable=False)
    subject_id = Column(String(50), index=True, nullable=True)
    hadm_id = Column(String(50), index=True, nullable=True)
    record_id = Column(String(50), nullable=True)
    table_name = Column(String(100), nullable=False)
    column_name = Column(String(100), nullable=False)
    rule_code = Column(String(20), nullable=False)
    rule_name = Column(String(150), nullable=False)
    original_value = Column(String(255), nullable=True)
    standardized_value = Column(String(255), nullable=True)
    expected_condition = Column(Text, nullable=False)
    actual_condition = Column(Text, nullable=False)
    anomaly_type = Column(String(50), nullable=False) # Future Timestamp, Sequence Violation, Invalid Duration, Missing Timestamp, Invalid Timestamp
    severity = Column(String(20), default="High") # Critical, High, Medium, Low
    status = Column(String(30), default="Detected") # Detected, Reviewed, Resolved, Ignored
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)

    validation_run = relationship("ValidationRun", back_populates="anomalies")

class EventMapping(Base):
    __tablename__ = "event_mappings"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    entity_id = Column(String(50), default="subject_id")
    event_name = Column(String(100), nullable=False) # e.g. Hospital Admission, ICU Intake, Lab Test, Discharge
    table_name = Column(String(100), nullable=False)
    timestamp_column = Column(String(100), nullable=False)
    sequence_order = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, nullable=True)
    username = Column(String(50), default="system")
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ProcessingMetric(Base):
    __tablename__ = "processing_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    validation_run_id = Column(Integer, nullable=True)
    stage_name = Column(String(100), nullable=False)
    records_processed = Column(Integer, default=0)
    duration_ms = Column(Float, default=0.0)
    speed_rps = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
