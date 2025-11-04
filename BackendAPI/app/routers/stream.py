from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import StreamSession, Track, User
from app.schemas.stream import StreamStartRequest, StreamStopRequest, StreamStartResponse
from app.dependencies import current_user

router = APIRouter(prefix="/api/stream", tags=["Streaming"])


@router.post("/start", response_model=StreamStartResponse, summary="Start music stream", description="Start a streaming session and return a stream URL")
def start_stream(payload: StreamStartRequest, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Create a streaming session for a track and return a mock stream URL."""
    # Resolve track (allow numeric IDs, else fallback placeholder)
    track_id = payload.trackId
    track = None
    try:
        tid_int = int(track_id)
        track = db.query(Track).filter(Track.id == tid_int).first()
        if not track:
            track = Track(id=tid_int, title=f"Track {tid_int}", artist="Unknown")
            db.add(track)
            db.flush()
    except Exception:
        # Non-integer id: create a placeholder track if not exists (string IDs are not primary key in DB, so no direct mapping)
        track = db.query(Track).filter(Track.title == str(track_id)).first()
        if not track:
            track = Track(title=str(track_id), artist="Unknown")
            db.add(track)
            db.flush()

    session = StreamSession(user_id=user.id, track_id=track.id)
    db.add(session)
    db.commit()
    db.refresh(session)

    # Mock a stream URL; in real life, generate signed URL or gateway path
    stream_url = f"https://stream.example.com/audio/{track.id}.mp3"
    return StreamStartResponse(session_id=session.id, track_id=str(track_id), stream_url=stream_url)


@router.post("/stop", summary="Stop music stream", description="Stop a streaming session")
def stop_stream(payload: StreamStopRequest, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Stop a streaming session if owned by user."""
    s = db.query(StreamSession).filter(StreamSession.id == payload.sessionId, StreamSession.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if s.ended_at:
        return {"ok": True}
    s.ended_at = datetime.utcnow()
    db.add(s)
    db.commit()
    return {"ok": True}
