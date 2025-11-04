from pydantic import BaseModel, Field, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")


class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")
    username: str = Field(..., description="Display name / username")


class AuthUser(BaseModel):
    id: int = Field(..., description="User id")
    email: EmailStr = Field(..., description="User email")
    username: str = Field(..., description="Username")
    is_admin: bool = Field(..., description="Admin flag")


class AuthResponse(BaseModel):
    token: str = Field(..., description="JWT access token")
    user: AuthUser = Field(..., description="User details")
