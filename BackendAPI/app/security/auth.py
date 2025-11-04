from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours default

# PUBLIC_INTERFACE
def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(password)


# PUBLIC_INTERFACE
def verify_password(plain_password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, password_hash)


# PUBLIC_INTERFACE
def create_access_token(subject: str, additional_claims: Optional[Dict[str, Any]] = None, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    """Create a signed JWT with subject claim and optional additional claims."""
    settings = get_settings()
    to_encode: Dict[str, Any] = {
        "sub": subject,
        "iss": settings.JWT_ISSUER,
        "iat": int(datetime.now(tz=timezone.utc).timestamp()),
        "nbf": int(datetime.now(tz=timezone.utc).timestamp()),
        "exp": int((datetime.now(tz=timezone.utc) + timedelta(minutes=expires_minutes)).timestamp()),
    }
    if additional_claims:
        to_encode.update(additional_claims)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# PUBLIC_INTERFACE
def verify_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT and return its claims."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM], options={"verify_aud": False})
        iss = payload.get("iss")
        if iss != settings.JWT_ISSUER:
            raise JWTError("Invalid issuer")
        return payload
    except JWTError as exc:  # noqa: BLE001
        raise exc
