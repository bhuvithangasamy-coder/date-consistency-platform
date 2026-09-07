from fastapi import APIRouter, Depends
from backend.app.config import settings

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("")
def get_system_settings():
    return {
        "project_name": settings.PROJECT_NAME,
        "kaggle_dataset": settings.KAGGLE_DATASET_ID,
        "kaggle_configured": bool(settings.KAGGLE_USERNAME and settings.KAGGLE_KEY),
        "database_url": settings.DATABASE_URL.replace("postgres:", "****:"),
        "java_home": settings.JAVA_HOME,
        "spark_driver_memory": settings.SPARK_DRIVER_MEMORY,
        "environment": "Production",
        "live_clinical_datasource_connected": True
    }
