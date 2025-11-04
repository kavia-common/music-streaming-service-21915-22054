from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import RecommendationEvent, Track, User
from app.dependencies import current_user

router = APIRouter(prefix="/api", tags=["Recommendations"])


@router.get("/recommendations", summary="Get personalized recommendations", description="Returns a simple list of tracks based on recent events")
def get_recommendations(user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Return a simple recommended track list based on recent events or latest tracks fallback."""
    # Very naive logic: if user has events, recommend latest tracks; else recommend latest in general
    _ = db.query(RecommendationEvent).filter(RecommendationEvent.user_id == user.id).order_by(RecommendationEvent.created_at.desc()).first()

    tracks = db.query(Track).order_by(Track.created_at.desc()).limit(10).all()

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

    return {"items": [to_dict(t) for t in tracks]}
