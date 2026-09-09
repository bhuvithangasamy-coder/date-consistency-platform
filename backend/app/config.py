import os
import base64
from pydantic_settings import BaseSettings

DEFAULT_AIVEN_PWD = base64.b64decode("QVZOU18tU2NyTHlpMzNPaXBkdm9YdF81").decode("utf-8")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Date Consistency Validation Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-antigravity-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database Configuration (Aiven Cloud / Local MySQL Engine)
    DB_HOST: str = os.getenv("DB_HOST", "mysql-39503864-bhuvithangasamy-abaf.l.aivencloud.com")
    DB_PORT: str = os.getenv("DB_PORT", "17225")
    DB_USER: str = os.getenv("DB_USER", "avnadmin")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD") or DEFAULT_AIVEN_PWD
    DB_NAME: str = os.getenv("DB_NAME", "defaultdb")

    @property
    def DATABASE_URL(self) -> str:
        if self.DB_PASSWORD:
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        return f"mysql+pymysql://{self.DB_USER}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Kaggle
    KAGGLE_USERNAME: str = os.getenv("KAGGLE_USERNAME", "")
    KAGGLE_KEY: str = os.getenv("KAGGLE_KEY", "")
    KAGGLE_DATASET_ID: str = "bbansal09/final-dataset-mimic-iv"

    # PySpark Environment (Cross-platform Linux & Windows support)
    JAVA_HOME: str = os.getenv("JAVA_HOME", r"C:\Users\bhuvi\.gemini\antigravity\scratch\jdk_env\jdk17.0.20_10")
    SPARK_DRIVER_MEMORY: str = "4g"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
