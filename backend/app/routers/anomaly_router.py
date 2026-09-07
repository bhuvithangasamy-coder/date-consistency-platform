import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Anomaly, ValidationRun
from backend.app.schemas import AnomalyResponse, AnomalyPaginatedResponse

router = APIRouter(prefix="/anomalies", tags=["Date Anomaly Report"])

@router.get("", response_model=AnomalyPaginatedResponse)
def search_anomalies(
    run_id: Optional[int] = None,
    subject_id: Optional[str] = None,
    table_name: Optional[str] = None,
    rule_code: Optional[str] = None,
    severity: Optional[str] = None,
    anomaly_type: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Anomaly)

    if run_id:
        query = query.filter(Anomaly.validation_run_id == run_id)
    if subject_id:
        query = query.filter(Anomaly.subject_id.ilike(f"%{subject_id}%"))
    if table_name:
        query = query.filter(Anomaly.table_name == table_name)
    if rule_code:
        query = query.filter(Anomaly.rule_code == rule_code)
    if severity:
        query = query.filter(Anomaly.severity == severity)
    if anomaly_type:
        query = query.filter(Anomaly.anomaly_type == anomaly_type)
    if search:
        query = query.filter(
            (Anomaly.rule_name.ilike(f"%{search}%")) |
            (Anomaly.actual_condition.ilike(f"%{search}%")) |
            (Anomaly.subject_id.ilike(f"%{search}%")) |
            (Anomaly.record_id.ilike(f"%{search}%"))
        )

    total = query.count()
    offset = (page - 1) * limit
    items = query.order_by(Anomaly.id.desc()).offset(offset).limit(limit).all()

    return AnomalyPaginatedResponse(
        total=total,
        page=page,
        limit=limit,
        anomalies=items
    )

@router.get("/{anomaly_id}", response_model=AnomalyResponse)
def get_anomaly_by_id(anomaly_id: int, db: Session = Depends(get_db)):
    anom = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anom:
        raise HTTPException(status_code=404, detail=f"Anomaly {anomaly_id} not found")
    return anom

@router.get("/export/csv")
def export_anomalies_csv(
    run_id: Optional[int] = None,
    severity: Optional[str] = None,
    anomaly_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Anomaly)
    if run_id:
        query = query.filter(Anomaly.validation_run_id == run_id)
    if severity:
        query = query.filter(Anomaly.severity == severity)
    if anomaly_type:
        query = query.filter(Anomaly.anomaly_type == anomaly_type)

    anomalies = query.order_by(Anomaly.id.desc()).limit(10000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Anomaly ID", "Subject ID", "HADM ID", "Record ID", "Table", "Column",
        "Rule ID", "Rule Name", "Original Value", "Standardized Value",
        "Expected Condition", "Actual Condition", "Anomaly Type", "Severity", "Detected At"
    ])

    for a in anomalies:
        writer.writerow([
            a.id, a.subject_id, a.hadm_id, a.record_id, a.table_name, a.column_name,
            a.rule_code, a.rule_name, a.original_value, a.standardized_value,
            a.expected_condition, a.actual_condition, a.anomaly_type, a.severity, a.detected_at
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=date_anomalies_report.csv"}
    )
