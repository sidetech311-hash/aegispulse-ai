import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from ..database.session import get_db
from ..models.models import UserDB
from ..schemas.schemas import (
    UserRegisterRequest, UserLoginRequest,
    AuthTokenResponse, UserProfileResponse
)
from ..core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_profile(user: UserDB) -> UserProfileResponse:
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        fullName=user.full_name,
        companyName=user.company_name,
        role=user.role,
        createdAt=user.created_at.strftime("%Y-%m-%d")
    )

def get_current_user_from_header(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> UserDB:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired or invalid signature"
        )
    user = db.query(UserDB).filter(UserDB.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
    return user

@router.post("/register", response_model=AuthTokenResponse)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    existing = db.query(UserDB).filter(UserDB.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    user = UserDB(
        id=user_id,
        email=email_clean,
        hashed_password=hash_password(req.password),
        full_name=req.fullName.strip(),
        company_name=req.companyName.strip(),
        role=req.role or "SecOps Analyst",
        created_at=datetime.datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "company": user.company_name})
    return AuthTokenResponse(
        accessToken=token,
        tokenType="bearer",
        user=format_user_profile(user)
    )

@router.post("/login", response_model=AuthTokenResponse)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    user = db.query(UserDB).filter(UserDB.email == email_clean).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    token = create_access_token({"sub": user.id, "email": user.email, "company": user.company_name})
    return AuthTokenResponse(
        accessToken=token,
        tokenType="bearer",
        user=format_user_profile(user)
    )

@router.get("/me", response_model=UserProfileResponse)
def get_me(user: UserDB = Depends(get_current_user_from_header)):
    return format_user_profile(user)

@router.post("/demo-login", response_model=AuthTokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """1-Click instant demo authentication for evaluators and recruiters."""
    demo_email = "alex.vance@apex-infra.cloud"
    user = db.query(UserDB).filter(UserDB.email == demo_email).first()
    if not user:
        user = UserDB(
            id=f"usr_demo_{uuid.uuid4().hex[:8]}",
            email=demo_email,
            hashed_password=hash_password("DemoPassword2026!"),
            full_name="Alex Vance",
            company_name="Apex Infrastructure",
            role="Lead SecOps Engineer",
            created_at=datetime.datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "company": user.company_name})
    return AuthTokenResponse(
        accessToken=token,
        tokenType="bearer",
        user=format_user_profile(user)
    )
