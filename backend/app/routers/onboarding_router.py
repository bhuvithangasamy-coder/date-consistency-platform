import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Dataset, DatasetTable, EventMapping, ValidationRule, AuditLog, User
from backend.app.schemas import DatasetOnboardRequest, DatasetResponse
from backend.app.auth import require_role

router = APIRouter(prefix="/onboarding", tags=["Dataset Onboarding"])

@router.post("/onboard", response_model=DatasetResponse)
def onboard_new_dataset(
    payload: DatasetOnboardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Analyst"]))
):
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "onboarded", payload.dataset_name.replace(" ", "_").lower())
    os.makedirs(upload_dir, exist_ok=True)

    dataset = Dataset(
        name=payload.dataset_name,
        source_type=payload.source_type,
        version="v1.0-onboarded",
        record_count=0,
        table_count=len(payload.tables),
        status="Ready",
        storage_path=upload_dir
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    total_records = 0
    for tbl in payload.tables:
        t_name = tbl.get("table_name", "custom_table")
        cnt = tbl.get("record_count", 50000)
        total_records += cnt
        db.add(DatasetTable(
            dataset_id=dataset.id,
            table_name=t_name,
            record_count=cnt,
            column_count=len(tbl.get("columns", [])),
            date_columns=tbl.get("date_columns", []),
            schema_info={"columns": tbl.get("columns", [])}
        ))

    # Event mappings
    for idx, em in enumerate(payload.event_mappings):
        db.add(EventMapping(
            entity_id=em.get("entity_id", "subject_id"),
            event_name=em.get("event_name", "Clinical Event"),
            table_name=em.get("table_name", "admissions"),
            timestamp_column=em.get("timestamp_column", "admittime"),
            sequence_order=idx + 1,
            is_active=True
        ))

    dataset.record_count = total_records

    db.add(AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        action="Onboard Dataset",
        entity_type="Dataset",
        entity_id=str(dataset.id),
        details=f"Onboarded new external dataset '{payload.dataset_name}' without modifying validation engine code."
    ))
    db.commit()
    db.refresh(dataset)
    return dataset
