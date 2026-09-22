import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

env_db_url = os.environ.get("DATABASE_URL")

if env_db_url:
    # Render and Heroku use postgres:// which SQLAlchemy 2.0 requires as postgresql://
    if env_db_url.startswith("postgres://"):
        DATABASE_URL = env_db_url.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL = env_db_url
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    # Default to local zero-config SQLite
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "aegispulse.db")
    DATABASE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
