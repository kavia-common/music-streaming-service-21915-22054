from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User
from app.security.auth import verify_token

bearer_scheme = HTTPBearer(auto_error=False)

# PUBLIC_INTERFACE
def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), db: Session = Depends(get_db)) -> User:
    """Return the authenticated user from Bearer token or raise 401."""
    if not credentials or not credentials.scheme.lower() == "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = credentials.credentials
    try:
        claims = verify_token(token)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    sub = claims.get("sub")
    try:
        user_id = int(sub)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid subject")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# PUBLIC_INTERFACE
def admin_required(user: User = Depends(current_user)) -> User:
    """Ensure current user is admin or raise 403."""
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user
