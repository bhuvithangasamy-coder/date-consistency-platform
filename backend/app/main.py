import os
import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User, Dataset, DatasetTable, ValidationRule, EventMapping, ValidationRun, Anomaly, AuditLog
from backend.app.auth import get_password_hash
from backend.app.mimic_schema import MIMIC_TABLES_SCHEMA, DEFAULT_RULES, DEFAULT_EVENT_MAPPINGS

from backend.app.routers import (
    auth_router,
    dataset_router,
    validation_router,
    dashboard_router,
    anomaly_router,
    timeline_router,
    rule_router,
    onboarding_router,
    audit_router,
    settings_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(dataset_router.router, prefix=settings.API_V1_STR)
app.include_router(validation_router.router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router.router, prefix=settings.API_V1_STR)
app.include_router(anomaly_router.router, prefix=settings.API_V1_STR)
app.include_router(timeline_router.router, prefix=settings.API_V1_STR)
app.include_router(rule_router.router, prefix=settings.API_V1_STR)
app.include_router(onboarding_router.router, prefix=settings.API_V1_STR)
app.include_router(audit_router.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_db_initializer():
    db = SessionLocal()
    try:
        # 1. Seed Users
        if not db.query(User).filter(User.username == "admin").first():
            db.add(User(username="admin", email="admin@hospital.org", hashed_password=get_password_hash("admin123"), role="Admin"))
            db.add(User(username="analyst", email="analyst@hospital.org", hashed_password=get_password_hash("analyst123"), role="Analyst"))
            db.add(User(username="viewer", email="viewer@hospital.org", hashed_password=get_password_hash("viewer123"), role="Viewer"))

        # 2. Seed Default Rules
        for r in DEFAULT_RULES:
            if not db.query(ValidationRule).filter(ValidationRule.rule_code == r["rule_code"]).first():
                db.add(ValidationRule(**r))

        # 3. Seed Event Mappings
        for em in DEFAULT_EVENT_MAPPINGS:
            if not db.query(EventMapping).filter(EventMapping.event_name == em["event_name"]).first():
                db.add(EventMapping(**em))

        # 4. Seed Dataset Entry
        dataset_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mimic_iv")
        dataset = db.query(Dataset).filter(Dataset.name == "MIMIC-IV Clinical Database (Kaggle)").first()
        if not dataset:
            dataset = Dataset(
                name="MIMIC-IV Clinical Database (Kaggle)",
                source_type="Kaggle Dataset",
                version="v2.2",
                record_count=1135000,
                table_count=len(MIMIC_TABLES_SCHEMA),
                status="Ready",
                storage_path=dataset_path
            )
            db.add(dataset)
            db.commit()
            db.refresh(dataset)

            for table_name, meta in MIMIC_TABLES_SCHEMA.items():
                db.add(DatasetTable(
                    dataset_id=dataset.id,
                    table_name=table_name,
                    record_count=500000 if table_name == "labevents" else (250000 if table_name == "prescriptions" else 50000),
                    column_count=len(meta["columns"]),
                    date_columns=meta["date_columns"],
                    schema_info={"columns": meta["columns"]}
                ))

        db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
