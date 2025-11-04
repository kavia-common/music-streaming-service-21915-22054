from typing import Optional
from pydantic import BaseModel, Field


class AdminCreateTrack(BaseModel):
    title: str = Field(..., description="Track title")
    artist: str = Field(..., description="Artist name")
    album: Optional[str] = Field(default=None, description="Album name")
    genre: Optional[str] = Field(default=None, description="Genre")
    duration: Optional[float] = Field(default=None, description="Duration seconds")
    cover_image: Optional[str] = Field(default=None, description="Cover image URL")
