from typing import Optional
from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    message: str = Field(..., description="Human-readable message")


class PaginatedUsers(BaseModel):
    items: list = Field(default_factory=list, description="Items list")
    total: Optional[int] = Field(default=None, description="Total items (optional)")
