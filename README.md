# Music Streaming Service

A full-stack music streaming service with:
- BackendAPI (FastAPI) — authentication (JWT), playlists, catalog search, recommendations, and streaming session endpoints, plus static audio serving for demo.
- WebFrontend (React) — responsive UI with login/register, search, playlists, recommendations, and simple player controls.

This README provides environment setup, local run instructions, migrations, seeding demo data, and API usage examples.

## Repository Structure

- BackendAPI/ — FastAPI service, Alembic migrations, and demo static audio support.
- WebFrontend/ — React app using CRA dev server with proxy to the backend.

## Prerequisites

- Node.js 18+ and npm (for WebFrontend)
- Python 3.11+ and pip (for BackendAPI)

## 1) BackendAPI Setup (port 8000)

1. Create environment file
   - Copy .env.example to .env and adjust values only if needed.
   ```
   cd BackendAPI
   cp .env.example .env
   ```

2. Install dependencies
   ```
   pip install -r requirements.txt
   ```

3. Run database migrations (Alembic)
   - Defaults to SQLite at sqlite:///./app.db (file in BackendAPI/)
   ```
   alembic upgrade head
   ```

4. (Optional) Seed demo data (admin user + some tracks)
   ```
   python -m scripts.seed_demo_data
   ```
   - Admin credentials (seed script): admin@example.com / adminadmin

5. Start the backend server on port 8000
   ```
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - OpenAPI/Swagger: http://localhost:8000/docs

Notes:
- To use Postgres, set DATABASE_URL in BackendAPI/.env (see .env.example).
- For direct calls from the frontend (without proxy), ensure CORS_ORIGINS includes your frontend origin.

## 2) WebFrontend Setup (port 3000)

1. Create environment file
   ```
   cd WebFrontend
   cp .env.example .env
   ```
   - Keep REACT_APP_API_BASE_URL empty to use the CRA dev proxy.
   - BACKEND_PROXY_TARGET defaults to http://localhost:8000 and can be changed if your backend runs elsewhere.

2. Install dependencies
   ```
   npm install
   ```

3. Start the frontend dev server (port 3000)
   ```
   npm start
   ```
   - Open http://localhost:3000
   - The CRA proxy will forward /api/* requests to BACKEND_PROXY_TARGET (default http://localhost:8000).

## 3) Quick Verification Flow

- Register a user at http://localhost:3000/register or use the seeded admin:
  - admin@example.com / adminadmin

- Login, then:
  - Search for tracks.
  - Create a playlist and add/remove tracks using the UI.
  - Use "Recommended for you" panel on the home page to play demo tracks.
  - Admin panel (requires admin user) can list users and create music tracks.

## 4) cURL Examples

Base URL: http://localhost:8000

1. Register
```
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"mypassword","username":"User1"}'
```

2. Login (get JWT)
```
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"mypassword"}'
```
Response:
```
{"token":"<JWT>","user":{"id":1,"email":"user1@example.com","username":"User1","is_admin":false}}
```
Export token for later:
```
export TOKEN="<JWT>"
```

3. Playlists
- List playlists
```
curl http://localhost:8000/api/playlists -H "Authorization: Bearer $TOKEN"
```

- Create playlist
```
curl -X POST http://localhost:8000/api/playlists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Playlist","description":"Favorites","cover_image":null}'
```

- Get details
```
curl http://localhost:8000/api/playlists/1 -H "Authorization: Bearer $TOKEN"
```

- Update (metadata and track operations)
```
# Add tracks with ids 1 and 2
curl -X PATCH http://localhost:8000/api/playlists/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"add_tracks":[1,2]}'

# Remove track id 2
curl -X PATCH http://localhost:8000/api/playlists/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remove_tracks":[2]}'
```

- Delete
```
curl -X DELETE http://localhost:8000/api/playlists/1 -H "Authorization: Bearer $TOKEN" -i
```

4. Catalog search
```
curl "http://localhost:8000/api/catalog/search?query=drive&genre=&artist=&album=&page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN"
```

5. Recommendations
```
curl http://localhost:8000/api/recommendations -H "Authorization: Bearer $TOKEN"
```

6. Streaming
```
# Start stream for trackId=1
curl -X POST http://localhost:8000/api/stream/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"trackId":"1"}'
```
Response:
```
{"session_id":10,"track_id":"1","stream_url":"/static/audio/1.mp3"}
```
If you have an mp3 file placed at BackendAPI/app/static/audio/1.mp3, you can stream it:
```
curl -H "Range: bytes=0-1023" http://localhost:8000/static/audio/1.mp3 -I
```

Stop streaming session:
```
curl -X POST http://localhost:8000/api/stream/stop \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":10}'
```

7. Admin (requires admin token)
```
# Login as admin (seeded): admin@example.com / adminadmin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminadmin"}'
export ADMIN_TOKEN="<JWT>"

# List users
curl http://localhost:8000/api/admin/users -H "Authorization: Bearer $ADMIN_TOKEN"

# Create track
curl -X POST http://localhost:8000/api/admin/music \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Lo-fi Study","artist":"Beat Lab","album":"Focus","genre":"Lo-fi","duration":210}'
```

## Notes

- Demo static audio: place files at BackendAPI/app/static/audio/{trackId}.mp3. The streaming start endpoint returns stream_url pointing to that path.
- During development, prefer using the CRA proxy (leave REACT_APP_API_BASE_URL blank). If you set REACT_APP_API_BASE_URL, ensure BackendAPI CORS_ORIGINS includes the frontend origin (e.g., http://localhost:3000).

## Docker (optional)

- Backend
  ```
  cd BackendAPI
  docker build -t music-backend:local .
  docker run --rm -p 8000:8000 --env-file ./.env music-backend:local
  ```

- Frontend
  - Run locally via npm start (recommended for dev).
