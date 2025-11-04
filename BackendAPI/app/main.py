from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request, HTTPException, status
from fastapi.responses import StreamingResponse, Response
from fastapi.routing import APIRoute
from sqlalchemy.orm import Session
from pathlib import Path
import os

from app.config import get_settings
from app.db.session import engine, SessionLocal
from app.db.models import Base, User, Track
from app.routers import auth as auth_router
from app.routers import playlists as playlists_router
from app.routers import catalog as catalog_router
from app.routers import recommendations as recommendations_router
from app.routers import stream as stream_router
from app.routers import admin as admin_router

settings = get_settings()

app = FastAPI(
    title="Music Streaming Backend API",
    description="FastAPI backend powering the music streaming service",
    version="1.0.0",
    openapi_tags=[
        {"name": "Auth", "description": "Authentication endpoints"},
        {"name": "Playlists", "description": "Playlist management"},
        {"name": "Catalog", "description": "Music catalog search"},
        {"name": "Recommendations", "description": "Personalized music recommendations"},
        {"name": "Streaming", "description": "Streaming session lifecycle"},
        {"name": "Admin", "description": "Administrative operations"},
        {"name": "Static", "description": "Static audio serving for demo (supports Range requests)"},
    ],
)

# Configure CORS
# If CORS_ORIGINS is not set, default to permissive for dev (since CRA proxy often bypasses CORS anyway)
cors_origins = settings.cors_origin_list()
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Default open in dev to ease local integration/tests
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Initialize DB and create tables
Base.metadata.create_all(bind=engine)

# Router registration
app.include_router(auth_router.router)
app.include_router(playlists_router.router)
app.include_router(catalog_router.router)
app.include_router(recommendations_router.router)
app.include_router(stream_router.router)
app.include_router(admin_router.router)

# --- Static audio serving with Range support (for demo streaming) ---
AUDIO_DIR = Path(__file__).resolve().parent.parent / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Provide a tiny built-in demo file note if directory is empty (no binary content here;
# users can place their own .mp3 files into BackendAPI/app/static/audio/)
README_NOTE = AUDIO_DIR.parent / "README.txt"
if not README_NOTE.exists():
    README_NOTE.write_text(
        "Place demo .mp3 files in this directory to stream locally.\n"
        "Example filename mapping used by /api/stream/start: {trackId}.mp3\n",
        encoding="utf-8",
    )


def _range_parse(range_header: str, file_size: int) -> tuple[int, int] | None:
    """
    Parse a HTTP Range header of form 'bytes=start-end' and return an inclusive (start, end) tuple.
    Returns None if header invalid.
    """
    try:
        units, _, rng = range_header.partition("=")
        if units.strip().lower() != "bytes":
            return None
        start_s, _, end_s = rng.partition("-")
        if start_s == "" and end_s == "":
            return None
        if start_s == "":
            # suffix range '-N' means last N bytes
            length = int(end_s)
            if length <= 0:
                return None
            start = max(0, file_size - length)
            end = file_size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else file_size - 1
        if start > end or start < 0 or end >= file_size:
            return None
        return (start, end)
    except Exception:
        return None


@app.get(
    "/static/audio/{filename}",
    tags=["Static"],
    summary="Serve static audio with Range support",
    description="Serves files from the app/static/audio directory with HTTP Range requests support for media playback.",
)
def serve_audio(filename: str, request: Request):
    """
    Serve audio files from the static directory with HTTP Range support.
    - Path: /static/audio/{filename}
    - Supports 'Range: bytes=start-end' for streaming and seeking.
    """
    file_path = AUDIO_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    file_size = file_path.stat().st_size
    range_header = request.headers.get("range")
    content_type = "audio/mpeg" if filename.lower().endswith(".mp3") else "application/octet-stream"

    if not range_header:
        # Serve full file
        def full_iter():
            with open(file_path, "rb") as f:
                chunk = f.read(64 * 1024)
                while chunk:
                    yield chunk
                    chunk = f.read(64 * 1024)

        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": content_type,
        }
        return StreamingResponse(full_iter(), status_code=200, headers=headers, media_type=content_type)

    # Partial content
    byte_range = _range_parse(range_header, file_size)
    if byte_range is None:
        # Invalid range
        return Response(status_code=416, headers={"Content-Range": f"bytes */{file_size}"})

    start, end = byte_range
    length = end - start + 1

    def range_iter(start_pos: int, end_pos: int):
        with open(file_path, "rb") as f:
            f.seek(start_pos)
            remaining = length
            while remaining > 0:
                chunk = f.read(min(64 * 1024, remaining))
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(length),
        "Content-Type": content_type,
    }
    return StreamingResponse(range_iter(start, end), status_code=206, headers=headers, media_type=content_type)


@app.get("/", tags=["Root"], summary="Health check", description="Simple health check/root endpoint")
def root():
    """Root endpoint to verify service is online."""
    return {"status": "ok"}

# Optionally seed a default admin for convenience in local development
def _seed_admin_and_demo():
    with SessionLocal() as db:  # type: Session
        if not db.query(User).filter(User.email == "admin@example.com").first():
            from app.security.auth import hash_password

            admin = User(email="admin@example.com", username="Admin", password_hash=hash_password("admin123"), is_admin=True)
            db.add(admin)
            db.commit()
        # Add a couple of demo tracks if none exist.
        if db.query(Track).count() == 0:
            demo_tracks = [
                Track(title="Sunrise", artist="Aurora", album="Morning Light", genre="Ambient", duration=180),
                Track(title="Night Drive", artist="Neon City", album="Midnight Run", genre="Synthwave", duration=240),
            ]
            db.add_all(demo_tracks)
            db.commit()


_seed_admin_and_demo()
