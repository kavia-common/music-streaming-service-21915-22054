from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Playlist, Track, User, playlist_tracks_table
from app.schemas.playlists import PlaylistCreate, PlaylistUpdate, PlaylistSummary, PlaylistDetail, TrackInfo
from app.dependencies import current_user

router = APIRouter(prefix="/api/playlists", tags=["Playlists"])


def to_summary(p: Playlist) -> PlaylistSummary:
    return PlaylistSummary(id=p.id, name=p.name, description=p.description, cover_image=p.cover_image)


def to_trackinfo(t: Track) -> TrackInfo:
    return TrackInfo(id=t.id, title=t.title, artist=t.artist, album=t.album, genre=t.genre, duration=t.duration, cover_image=t.cover_image)


def to_detail(p: Playlist) -> PlaylistDetail:
    tracks = [to_trackinfo(t) for t in (p.tracks or [])]
    return PlaylistDetail(id=p.id, name=p.name, description=p.description, cover_image=p.cover_image, tracks=tracks)


@router.get("", response_model=List[PlaylistSummary], summary="List user playlists", description="Return current user's playlists")
def list_playlists(user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Return the current user's playlists."""
    items = db.query(Playlist).filter(Playlist.owner_id == user.id).order_by(Playlist.created_at.desc()).all()
    return [to_summary(p) for p in items]


@router.post("", response_model=PlaylistSummary, status_code=201, summary="Create playlist")
def create_playlist(payload: PlaylistCreate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Create a new playlist owned by the current user."""
    p = Playlist(name=payload.name, description=payload.description, cover_image=payload.cover_image, owner_id=user.id)
    db.add(p)
    db.commit()
    db.refresh(p)
    return to_summary(p)


@router.get("/{playlist_id}", response_model=PlaylistDetail, summary="Get playlist details")
def get_playlist(playlist_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Get details for a playlist owned by the user."""
    p = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.owner_id == user.id).first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")
    return to_detail(p)


@router.patch("/{playlist_id}", response_model=PlaylistDetail, summary="Update playlist (metadata and track ops)")
def update_playlist(playlist_id: int, payload: PlaylistUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Update playlist metadata and optionally add/remove tracks via PATCH."""
    p = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.owner_id == user.id).first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    # Metadata updates
    if payload.name is not None:
        p.name = payload.name
    if payload.description is not None:
        p.description = payload.description
    if payload.cover_image is not None:
        p.cover_image = payload.cover_image

    # Track operations
    if payload.add_tracks:
        # Ensure tracks exist; create placeholders if they don't
        for tid in payload.add_tracks:
            track = db.query(Track).filter(Track.id == tid).first()
            if not track:
                # Create a minimal placeholder track for demo purposes
                track = Track(id=tid, title=f"Track {tid}", artist="Unknown")
                db.add(track)
                db.flush()
            # Link if not already present
            if track not in p.tracks:
                p.tracks.append(track)

    if payload.remove_tracks:
        p.tracks = [t for t in p.tracks if t.id not in set(payload.remove_tracks)]

    db.add(p)
    db.commit()
    db.refresh(p)
    return to_detail(p)


@router.delete("/{playlist_id}", status_code=204, summary="Delete playlist")
def delete_playlist(playlist_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Delete a playlist owned by the current user."""
    p = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.owner_id == user.id).first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")
    db.delete(p)
    db.commit()
    return
