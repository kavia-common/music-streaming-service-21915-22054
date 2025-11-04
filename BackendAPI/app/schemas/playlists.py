from typing import List, Optional
from pydantic import BaseModel, Field


class PlaylistCreate(BaseModel):
    name: str = Field(..., description="Playlist name")
    description: Optional[str] = Field(default=None, description="Playlist description")
    cover_image: Optional[str] = Field(default=None, description="Cover image URL")


class PlaylistUpdate(BaseModel):
    name: Optional[str] = Field(default=None, description="Playlist name")
    description: Optional[str] = Field(default=None, description="Playlist description")
    cover_image: Optional[str] = Field(default=None, description="Cover image URL")

    # Track operations for PATCH
    add_tracks: Optional[List[int]] = Field(default=None, description="List of track IDs to add")
    remove_tracks: Optional[List[int]] = Field(default=None, description="List of track IDs to remove")


class PlaylistSummary(BaseModel):
    id: int = Field(..., description="Playlist id")
    name: str = Field(..., description="Name")
    description: Optional[str] = Field(default=None, description="Description")
    cover_image: Optional[str] = Field(default=None, description="Cover image URL")


class TrackInfo(BaseModel):
    id: int = Field(..., description="Track id")
    title: str = Field(..., description="Title")
    artist: str = Field(..., description="Artist")
    album: Optional[str] = Field(default=None, description="Album")
    genre: Optional[str] = Field(default=None, description="Genre")
    duration: Optional[float] = Field(default=None, description="Length in seconds")
    cover_image: Optional[str] = Field(default=None, description="Cover image URL")


class PlaylistDetail(PlaylistSummary):
    tracks: List[TrackInfo] = Field(default_factory=list, description="Tracks in playlist")
