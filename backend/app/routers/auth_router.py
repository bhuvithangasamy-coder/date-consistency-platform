from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, AuditLog
from backend.app.schemas import LoginRequest, TokenResponse, UserResponse
from backend.app.auth import verify_password, create_access_token, get_current_user, get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    access_token = create_access_token(data={"sub": user.username, "role": user.role})

    # Log action
    db.add(AuditLog(
        user_id=user.id,
        username=user.username,
        action="User Login",
        entity_type="User",
        entity_id=str(user.id),
        details=f"User '{user.username}' logged in successfully as {user.role}"
    ))
    db.commit()

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        username=user.username,
        role=user.role
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
