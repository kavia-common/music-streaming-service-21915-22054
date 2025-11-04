# BackendAPI (FastAPI) for Music Streaming Service

This is the FastAPI backend for the music streaming service. It provides REST endpoints for:
- Authentication (JWT-based)
- Playlists CRUD with track management
- Catalog search (simple in-DB-like mock search)
- Recommendations (basic heuristic based on past events)
- Streaming sessions (mock stream URL responses)
- Admin operations (list users, create/list music tracks)

It uses:
- FastAPI + Uvicorn
- SQLAlchemy ORM (SQLite by default)
- Pydantic for request/response models
- python-jose for JWT
- bcrypt for password hashing
- CORS configurable via env

Run locally on 0.0.0.0:8000 by default.

## Quickstart

1) Create and configure environment
- Copy .env.example to .env and fill in values as needed. Defaults are reasonable.
```
cp .env.example .env
```

2) Install dependencies (preferably in a virtual environment)
```
pip install -r requirements.txt
```

3) Create database and run migrations (Alembic)
- By default, DATABASE_URL uses SQLite: `sqlite:///./app.db`
- To use Postgres, set `DATABASE_URL=postgresql+psycopg2://USER:PASS@HOST:PORT/DBNAME` in .env

Common migration commands:
```
# Create DB schema to latest
alembic upgrade head

# If you change models and want a new migration (edit script afterwards if needed)
alembic revision --autogenerate -m "your message"

# Downgrade one step (use with care)
alembic downgrade -1
```

4) (Optional) Seed demo data
```
python -m scripts.seed_demo_data
```

5) Start the server
```
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --reload
```

The API will be available at:
- http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

## Environment variables

See .env.example for full list.
- SECRET_KEY: JWT secret used for signing.
- JWT_ISSUER: Expected issuer for JWTs.
- DATABASE_URL: SQLAlchemy database URL. Default: sqlite:///./app.db
- CORS_ORIGINS: Comma-separated list of allowed origins for CORS (set to empty when using CRA proxy).
- PORT: Server port, default 8000.

Note: Do not commit secrets. This repository includes .env.example only.

## Development notes

- Uses SQLite by default to simplify local setup. The project is structured for later Alembic migrations (alembic not wired yet).
- Minimal seed/demo logic is included where helpful.
- Admin endpoints require an admin user (User.is_admin == True).

## API overview (paths consumed by the React WebFrontend)

- Auth:
  - POST /api/auth/login
  - POST /api/auth/register
- Playlists:
  - GET /api/playlists
  - POST /api/playlists
  - GET /api/playlists/{id}
  - PATCH /api/playlists/{id}  (update metadata; add/remove tracks)
  - DELETE /api/playlists/{id}
- Catalog:
  - GET /api/catalog/search?query=...&genre=...&artist=...&album=...
- Recommendations:
  - GET /api/recommendations
- Streaming:
  - POST /api/stream/start   (body: { trackId })
  - POST /api/stream/stop    (body: { sessionId })
- Admin:
  - GET /api/admin/users
  - POST /api/admin/music
  - GET /api/admin/music

Auth responses return:
- { token, user }

Streaming start returns:
- { stream_url, session_id, track_id }

## Running with Docker (optional)

Build image:
```
docker build -t music-backend:local .
```

Run:
```
docker run --rm -p 8000:8000 --env-file ./.env music-backend:local
```

## Project structure

- app/
  - main.py            -> FastAPI app factory, CORS, routers
  - config.py          -> Settings from environment
  - dependencies.py    -> Common dependencies (current_user, admin_required)
  - db/
    - session.py       -> SQLAlchemy engine/session
    - models.py        -> ORM models
  - schemas/           -> Pydantic models
  - security/
    - auth.py          -> Hashing and JWT utilities
  - routers/
    - auth.py
    - playlists.py
    - catalog.py
    - recommendations.py
    - stream.py
    - admin.py

## Notes on Frontend integration

- The CRA dev proxy forwards /api/* to the backend; therefore, this backend registers routes under /api/* paths.
- If you set REACT_APP_API_BASE_URL in the frontend, ensure CORS_ORIGINS includes that origin.

