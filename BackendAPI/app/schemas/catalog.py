from typing import List, Optional
from pydantic import BaseModel, Field


class CatalogSearchResponse(BaseModel):
    items: List[dict] = Field(default_factory=list, description="Search results")
    total: Optional[int] = Field(default=None, description="Total results (optional)")
