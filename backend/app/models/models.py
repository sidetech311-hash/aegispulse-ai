import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from ..database.session import Base

class UserDB(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    role = Column(String, default="SecOps Analyst") # Admin, SecOps Analyst, Security Engineer
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class IncidentDB(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    cve = Column(String, nullable=True)
    severity = Column(String, nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String, default="Open")     # Open, Investigating, Resolved
    timestamp = Column(String, nullable=False)
    target_asset = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    attack_vector = Column(String, nullable=False)
    mitigation_available = Column(Boolean, default=True)
    company_name = Column(String, nullable=True, default="Apex Infrastructure")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MonitoredAssetDB(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # Cloud VPS, Domain / DNS, etc.
    endpoint = Column(String, nullable=False)
    status = Column(String, default="Healthy") # Healthy, Warning, Compromised
    last_scanned = Column(String, default="Just now")
    company_name = Column(String, nullable=True, default="Apex Infrastructure")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScanReportDB(Base):
    __tablename__ = "scan_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain = Column(String, index=True)
    ip = Column(String)
    posture_score = Column(Integer)
    grade = Column(String)
    ssl_valid = Column(Boolean, default=True)
    ssl_days_remaining = Column(Integer)
    ssl_issuer = Column(String)
    headers_json = Column(Text)
    open_ports_json = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
