from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, Track
from app.schemas.admin import AdminCreateTrack
from app.schemas.common import PaginatedUsers
from app.dependencies import admin_required

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=PaginatedUsers, summary="List users (admin)")
def list_users(page: int = Query(default=1, ge=1), page_size: int = Query(default=10, ge=1, le=100), db: Session = Depends(get_db), _: User = Depends(admin_required)):  # type: ignore  # noqa: E501
    """Return a paginated list of users for admin view."""
    q = db.query(User).order_by(User.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    def to_dict(u: User) -> dict:
        return {
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat(),
        }

    return PaginatedUsers(items=[to_dict(u) for u in items], total=total)


@router.post("/music", status_code=201, summary="Create music track (admin)")
def create_music(payload: AdminCreateTrack, db: Session = Depends(get_db), _: User = Depends(admin_required)):  # type: ignore
    """Create a new music track."""
    t = Track(
        title=payload.title,
        artist=payload.artist,
        album=payload.album,
        genre=payload.genre,
        duration=payload.duration,
        cover_image=payload.cover_image,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return {
        "id": t.id,
        "title": t.title,
        "artist": t.artist,
        "album": t.album,
        "genre": t.genre,
        "duration": t.duration,
        "cover_image": t.cover_image,
    }


@router.get("/music", summary="List music tracks (admin)")
def list_music(db: Session = Depends(get_db), _: User = Depends(admin_required)):  # type: ignore
    """List latest music tracks."""
    items = db.query(Track).order_by(Track.created_at.desc()).limit(100).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "artist": t.artist,
            "album": t.album,
            "genre": t.genre,
            "duration": t.duration,
            "cover_image": t.cover_image,
        }
        for t in items
    ]
