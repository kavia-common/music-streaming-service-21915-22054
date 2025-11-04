from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse, AuthUser
from app.security.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=AuthResponse, summary="User login", description="Authenticate user and return JWT token and user info")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint: validates credentials and returns { token, user }."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id), additional_claims={"email": user.email, "is_admin": user.is_admin})
    return AuthResponse(
        token=token,
        user=AuthUser(id=user.id, email=user.email, username=user.username, is_admin=user.is_admin),
    )


@router.post("/register", status_code=201, summary="User registration", description="Create a new user account")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register endpoint: creates a user with hashed password."""
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(email=payload.email, username=payload.username, password_hash=hash_password(payload.password), is_admin=False)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "username": user.username, "is_admin": user.is_admin}
