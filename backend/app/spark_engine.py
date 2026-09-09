import os
import sys
import time
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

# Ensure JAVA_HOME is set for PySpark
JAVA_HOME = r"C:\Users\bhuvi\.gemini\antigravity\scratch\jdk_env\jdk17.0.20_10"
os.environ["JAVA_HOME"] = JAVA_HOME
os.environ["PATH"] = os.path.join(JAVA_HOME, "bin") + os.path.pathsep + os.environ.get("PATH", "")

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import StringType

from backend.app.models import ValidationRun, Anomaly, ProcessingMetric, AuditLog, Dataset
from backend.app.mimic_schema import DEFAULT_RULES

_spark_session = None

def get_spark_session() -> SparkSession:
    global _spark_session
    need_create = False
    if _spark_session is None:
        need_create = True
    else:
        try:
            # Ping active JVM context to verify Py4J socket is alive
            if _spark_session._sc._jsc is None or _spark_session._sc._jsc.sc().isStopped():
                need_create = True
        except Exception:
            need_create = True

    if need_create:
        try:
            if _spark_session is not None:
                _spark_session.stop()
        except Exception:
            pass
        driver_mem = os.getenv("SPARK_DRIVER_MEMORY", "512m" if os.getenv("RENDER") else "2g")
        _spark_session = SparkSession.builder \
            .appName("DateConsistencyValidationEngine") \
            .master("local[2]") \
            .config("spark.driver.memory", driver_mem) \
            .config("spark.executor.memory", "512m") \
            .config("spark.sql.shuffle.partitions", "4") \
            .config("spark.ui.enabled", "false") \
            .getOrCreate()


    return _spark_session



def run_pyspark_validation(db: Session, dataset_id: int, user_id: int = None, active_rules: List[Dict[str, Any]] = None) -> ValidationRun:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise ValueError(f"Dataset with ID {dataset_id} not found")

    spark = get_spark_session()
    start_time = time.time()
    run_num = f"RUN-{int(start_time)}"
    
    # 1. Create ValidationRun DB record
    val_run = ValidationRun(
        dataset_id=dataset_id,
        run_number=run_num,
        user_id=user_id,
        status="Running",
        started_at=datetime.datetime.utcnow()
    )
    db.add(val_run)
    db.commit()
    db.refresh(val_run)

    dataset_dir = dataset.storage_path
    if not os.path.exists(dataset_dir):
        # Fallback to backend/data/mimic_iv
        dataset_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mimic_iv")

    rules_to_run = active_rules if active_rules else DEFAULT_RULES

    total_records = 0
    total_anomalies_list = []
    missing_count = 0
    invalid_duration_count = 0
    sequence_count = 0
    future_count = 0
    invalid_fmt_count = 0

    ref_future_date = "2026-09-01 23:59:59"

    # Stage 1: Load and Validate Tables
    tables_to_process = ["admissions", "transfers", "labevents", "prescriptions", "icustays", "patients"]

    for table in tables_to_process:
        csv_file = os.path.join(dataset_dir, f"{table}.csv")
        if not os.path.exists(csv_file):
            continue

        stage_start = time.time()
        try:
            df = spark.read.option("header", "true").csv(csv_file)
            table_records = df.count()
        except Exception:
            # Re-initialize Spark session on socket disconnect and retry
            spark = get_spark_session()
            df = spark.read.option("header", "true").csv(csv_file)
            table_records = df.count()

        total_records += table_records


        # Find rules matching this table
        table_rules = [r for r in rules_to_run if r.get("source_table") == table and r.get("status") == "Active"]

        for rule in table_rules:
            code = rule.get("rule_code")
            name = rule.get("name")
            left = rule.get("left_field")
            right = rule.get("right_field")
            op = rule.get("operator")
            severity = rule.get("severity", "High")

            if op == "IS_NOT_NULL":
                # Check missing timestamp
                bad_df = df.filter(F.col(left).isNull() | (F.trim(F.col(left)) == ""))
                bad_count = bad_df.count()
                if bad_count > 0:
                    missing_count += bad_count
                    sample_rows = bad_df.limit(100).collect()
                    for r in sample_rows:
                        total_anomalies_list.append(Anomaly(
                            validation_run_id=val_run.id,
                            subject_id=str(r["subject_id"]) if "subject_id" in r else None,
                            hadm_id=str(r["hadm_id"]) if "hadm_id" in r else None,
                            record_id=str(r[df.columns[0]]),
                            table_name=table,
                            column_name=left,
                            rule_code=code,
                            rule_name=name,
                            original_value=None,
                            standardized_value=None,
                            expected_condition=f"{left} must not be NULL or empty",
                            actual_condition=f"{left} is NULL or missing",
                            anomaly_type="Missing Timestamp",
                            severity=severity,
                            status="Detected"
                        ))

            elif op == "<=":
                # Compare left <= right
                if left in df.columns and right in df.columns:
                    # Filter rows where left > right
                    bad_df = df.filter((F.col(left).isNotNull()) & (F.col(right).isNotNull()) & (F.col(left) > F.col(right)))
                    bad_count = bad_df.count()
                    if bad_count > 0:
                        if code == "RULE-001" or code == "RULE-002" or code == "RULE-005":
                            invalid_duration_count += bad_count
                        else:
                            sequence_count += bad_count

                        sample_rows = bad_df.limit(100).collect()
                        for r in sample_rows:
                            total_anomalies_list.append(Anomaly(
                                validation_run_id=val_run.id,
                                subject_id=str(r["subject_id"]) if "subject_id" in r else None,
                                hadm_id=str(r["hadm_id"]) if "hadm_id" in r else None,
                                record_id=str(r[df.columns[0]]),
                                table_name=table,
                                column_name=f"{left} -> {right}",
                                rule_code=code,
                                rule_name=name,
                                original_value=f"{left}: {r[left]}, {right}: {r[right]}",
                                standardized_value=f"{left}: {r[left]}, {right}: {r[right]}",
                                expected_condition=f"{left} ({r[left]}) <= {right} ({r[right]})",
                                actual_condition=f"Chronology Violation: {left} occurred after {right}",
                                anomaly_type="Invalid Duration" if op == "<=" else "Sequence Violation",
                                severity=severity,
                                status="Detected"
                            ))

            elif op == "NOT_FUTURE":
                if left in df.columns:
                    bad_df = df.filter((F.col(left).isNotNull()) & (F.col(left) > ref_future_date))
                    bad_count = bad_df.count()
                    if bad_count > 0:
                        future_count += bad_count
                        sample_rows = bad_df.limit(100).collect()
                        for r in sample_rows:
                            total_anomalies_list.append(Anomaly(
                                validation_run_id=val_run.id,
                                subject_id=str(r["subject_id"]) if "subject_id" in r else None,
                                hadm_id=str(r["hadm_id"]) if "hadm_id" in r else None,
                                record_id=str(r[df.columns[0]]),
                                table_name=table,
                                column_name=left,
                                rule_code=code,
                                rule_name=name,
                                original_value=str(r[left]),
                                standardized_value=str(r[left]),
                                expected_condition=f"{left} <= {ref_future_date}",
                                actual_condition=f"Future Timestamp Detected: {r[left]} is in the future",
                                anomaly_type="Future Timestamp",
                                severity=severity,
                                status="Detected"
                            ))

            elif op == "VALID_FORMAT":
                if left in df.columns:
                    # Filter invalid date format (contains '/')
                    bad_df = df.filter((F.col(left).isNotNull()) & (F.col(left) != "") & (F.col(left).contains("/")))
                    bad_count = bad_df.count()
                    if bad_count > 0:
                        invalid_fmt_count += bad_count
                        sample_rows = bad_df.limit(100).collect()
                        for r in sample_rows:
                            total_anomalies_list.append(Anomaly(
                                validation_run_id=val_run.id,
                                subject_id=str(r["subject_id"]) if "subject_id" in r else None,
                                hadm_id=None,
                                record_id=str(r[df.columns[0]]),
                                table_name=table,
                                column_name=left,
                                rule_code=code,
                                rule_name=name,
                                original_value=str(r[left]),
                                standardized_value=str(r[left]).replace("/", "-"),
                                expected_condition="Timestamp must follow YYYY-MM-DD HH:MM:SS",
                                actual_condition=f"Unstandardized Format: {r[left]}",
                                anomaly_type="Invalid Timestamp",
                                severity=severity,
                                status="Detected"
                            ))

        stage_duration = (time.time() - stage_start) * 1000
        db.add(ProcessingMetric(
            validation_run_id=val_run.id,
            stage_name=f"Rule Validation ({table})",
            records_processed=table_records,
            duration_ms=stage_duration,
            speed_rps=table_records / (stage_duration / 1000.0) if stage_duration > 0 else 0
        ))

    # Bulk insert anomalies
    if total_anomalies_list:
        db.bulk_save_objects(total_anomalies_list)

    total_violations = missing_count + invalid_duration_count + sequence_count + future_count + invalid_fmt_count
    # Estimate total distinct records with anomalies
    records_with_anomalies = min(total_records, total_violations)
    valid_records = max(0, total_records - records_with_anomalies)
    quality_score = round((valid_records / total_records * 100.0), 2) if total_records > 0 else 100.0

    end_time = time.time()
    duration_sec = round(end_time - start_time, 2)

    val_run.total_records = total_records
    val_run.valid_records = valid_records
    val_run.records_with_anomalies = records_with_anomalies
    val_run.total_violations = total_violations
    val_run.missing_timestamps = missing_count
    val_run.invalid_durations = invalid_duration_count
    val_run.sequence_violations = sequence_count
    val_run.future_timestamps = future_count
    val_run.invalid_timestamps = invalid_fmt_count
    val_run.quality_score = quality_score
    val_run.status = "Completed"
    val_run.completed_at = datetime.datetime.utcnow()
    val_run.duration_seconds = duration_sec

    dataset.last_validated_at = datetime.datetime.utcnow()
    dataset.record_count = total_records

    # Audit Log
    db.add(AuditLog(
        user_id=user_id,
        username="system" if not user_id else "user",
        action="Run Validation",
        entity_type="ValidationRun",
        entity_id=str(val_run.id),
        details=f"Processed {total_records:,} records in {duration_sec}s. Quality Score: {quality_score}%. Total Anomalies: {total_violations:,}"
    ))

    db.commit()
    db.refresh(val_run)
    return val_run
