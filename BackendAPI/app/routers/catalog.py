from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Track
from app.schemas.catalog import CatalogSearchResponse
from app.dependencies import current_user, User  # type: ignore

router = APIRouter(prefix="/api/catalog", tags=["Catalog"])


@router.get("/search", response_model=CatalogSearchResponse, summary="Search catalog", description="Simple search over tracks by query and optional filters")
def search_catalog(
    query: str = Query(..., description="Search query"),
    genre: Optional[str] = Query(default=None),
    artist: Optional[str] = Query(default=None),
    album: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(current_user),  # noqa: ARG001
):
    """Perform a simple LIKE-based search on Track fields."""
    q = db.query(Track)
    q = q.filter(Track.title.ilike(f"%{query}%") | Track.artist.ilike(f"%{query}%") | Track.album.ilike(f"%{query}%"))
    if genre:
        q = q.filter(Track.genre.ilike(f"%{genre}%"))
    if artist:
        q = q.filter(Track.artist.ilike(f"%{artist}%"))
    if album:
        q = q.filter(Track.album.ilike(f"%{album}%"))

    total = q.count()
    items = q.order_by(Track.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    def to_dict(t: Track) -> dict:
        return {
            "id": t.id,
            "title": t.title,
            "artist": t.artist,
            "album": t.album,
            "genre": t.genre,
            "duration": t.duration,
            "cover_image": t.cover_image,
        }

    return CatalogSearchResponse(items=[to_dict(t) for t in items], total=total)
