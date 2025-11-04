from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
    Text,
    Float,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column

Base = declarative_base()

# Association table for Playlist <-> Tracks (many-to-many)
playlist_tracks_table = Table(
    "playlist_tracks",
    Base.metadata,
    Column("playlist_id", ForeignKey("playlists.id", ondelete="CASCADE"), primary_key=True),
    Column("track_id", ForeignKey("tracks.id", ondelete="CASCADE"), primary_key=True),
    UniqueConstraint("playlist_id", "track_id", name="uq_playlist_track"),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(64), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    playlists: Mapped[list["Playlist"]] = relationship("Playlist", back_populates="owner", cascade="all,delete")


class Track(Base):
    __tablename__ = "tracks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    artist: Mapped[str] = mapped_column(String(255), nullable=False)
    album: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    genre: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    duration: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # seconds
    cover_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Playlist(Base):
    __tablename__ = "playlists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cover_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner: Mapped["User"] = relationship("User", back_populates="playlists")
    tracks: Mapped[list["Track"]] = relationship("Track", secondary=playlist_tracks_table, lazy="joined")


class RecommendationEvent(Base):
    __tablename__ = "recommendation_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    track_id: Mapped[int] = mapped_column(Integer, ForeignKey("tracks.id", ondelete="SET NULL"))
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g., "play", "like"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class StreamSession(Base):
    __tablename__ = "stream_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    track_id: Mapped[int] = mapped_column(Integer, ForeignKey("tracks.id", ondelete="SET NULL"))
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Helper
    def is_active(self) -> bool:
        if self.ended_at:
            return False
        # Consider session active for up to 24 hours unless stopped explicitly
        return (datetime.utcnow() - self.started_at) < timedelta(hours=24)
