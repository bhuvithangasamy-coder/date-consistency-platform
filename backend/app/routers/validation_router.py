from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import ValidationRun, ValidationRule, ProcessingMetric, Dataset, User
from backend.app.schemas import ValidationRunResponse
from backend.app.auth import get_current_user, require_role
from backend.app.spark_engine import run_pyspark_validation

router = APIRouter(prefix="/validation", tags=["Date Validation Engine"])

@router.post("/run", response_model=ValidationRunResponse)
def trigger_validation_run(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Analyst"]))
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found")

    active_rules_db = db.query(ValidationRule).filter(ValidationRule.status == "Active").all()
    rules_dict = [
        {
            "rule_code": r.rule_code,
            "name": r.name,
            "description": r.description,
            "source_table": r.source_table,
            "left_field": r.left_field,
            "operator": r.operator,
            "right_field": r.right_field,
            "severity": r.severity,
            "status": r.status,
            "version": r.version
        }
        for r in active_rules_db
    ]

    try:
        val_run = run_pyspark_validation(
            db=db,
            dataset_id=dataset_id,
            user_id=current_user.id,
            active_rules=rules_dict
        )
        return val_run
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PySpark Validation Engine Failed: {str(e)}")

@router.get("/runs", response_model=List[ValidationRunResponse])
def get_validation_runs(dataset_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(ValidationRun)
    if dataset_id:
        query = query.filter(ValidationRun.dataset_id == dataset_id)
    runs = query.order_by(ValidationRun.id.desc()).all()
    return runs

@router.get("/runs/{run_id}", response_model=ValidationRunResponse)
def get_validation_run_by_id(run_id: int, db: Session = Depends(get_db)):
    val_run = db.query(ValidationRun).filter(ValidationRun.id == run_id).first()
    if not val_run:
        raise HTTPException(status_code=404, detail=f"Validation run {run_id} not found")
    return val_run

@router.get("/runs/{run_id}/metrics")
def get_run_metrics(run_id: int, db: Session = Depends(get_db)):
    metrics = db.query(ProcessingMetric).filter(ProcessingMetric.validation_run_id == run_id).all()
    return [
        {
            "stage_name": m.stage_name,
            "records_processed": m.records_processed,
            "duration_ms": m.duration_ms,
            "speed_rps": m.speed_rps,
            "timestamp": m.timestamp
        }
        for m in metrics
    ]
