import socket
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.app.config import settings

def create_db_engine():
    try:
        # Check DNS resolution if remote cloud host
        if "aivencloud.com" in settings.DB_HOST:
            socket.gethostbyname(settings.DB_HOST)
            connect_args = {"ssl": {"check_hostname": False}}
        else:
            connect_args = {}

        eng = create_engine(
            settings.DATABASE_URL,
            connect_args=connect_args,
            pool_size=10,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        with eng.connect() as conn:
            pass
        print("Connected to Primary MySQL Database Engine successfully.")
        return eng
    except Exception as e:
        print(f"Primary Database Connection Notice ({e}). Initializing Standalone Failover Engine...")
        sqlite_url = "sqlite:///./date_validation.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
