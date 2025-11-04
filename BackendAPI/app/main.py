from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

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
    ],
)

# Configure CORS for direct frontend calls (in dev prefer CRA proxy, then CORS not needed)
if settings.cors_origin_list():
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list(),
        allow_credentials=True,
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
