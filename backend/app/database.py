from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.app.config import settings

# Support SSL for Aiven Cloud MySQL
connect_args = {}
if "aivencloud.com" in settings.DB_HOST:
    connect_args = {"ssl": {"check_hostname": False}}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
