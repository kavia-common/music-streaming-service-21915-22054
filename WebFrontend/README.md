# WebFrontend (React) for Music Streaming Service

A modern, lightweight React app that provides the UI for the music streaming platform:
- Authentication (login/register)
- Catalog search
- Playlists (list, create, edit, delete, add/remove tracks)
- Recommendations
- Streaming controls (via start/stop endpoints, wired in player hook)
- Admin panels (users and music)

This app communicates with the Backend API via REST using axios, with Create React App (CRA) dev proxy for local development.

## Quickstart

1) Install dependencies
- npm install

2) Configure environment variables
- Copy .env.example to .env and adjust as needed
- See "Environment variables" section below

3) Start the dev server
- npm start
- App runs at http://localhost:3000

4) Backend notes
- During local dev, requests to /api/* are proxied to http://localhost:8000 by default (configurable)
- Ensure your backend exposes the expected endpoints (see "Backend endpoints" below)

## Environment variables

Create a .env file in this directory (based on .env.example). The following variables are supported:

- REACT_APP_API_BASE_URL
  - Base URL used by axios (src/api/client.js).
  - If empty, axios uses same-origin, and CRA dev proxy will forward /api/* to the backend target.
  - Example (direct calls, bypass proxy): REACT_APP_API_BASE_URL=http://localhost:8000

- REACT_APP_OBS_ENABLED
  - Feature flag to toggle observability/monitoring features in the frontend (planned integration).
  - Example: REACT_APP_OBS_ENABLED=false

- REACT_APP_OBS_BASE_URL
  - Observability backend base URL if observability is enabled.
  - Example: REACT_APP_OBS_BASE_URL=http://localhost:9000

Optional (dev proxy control):
- BACKEND_PROXY_TARGET
  - Used only by CRA dev server via src/setupProxy.js
  - Default: http://localhost:8000
  - Example: BACKEND_PROXY_TARGET=http://localhost:8001

Tip:
- Use the proxy for local development (leave REACT_APP_API_BASE_URL blank) and set BACKEND_PROXY_TARGET if your backend is not on :8000.

## Local development

- npm install
- npm start
  - Opens http://localhost:3000
  - CRA dev proxy forwards /api/* → BACKEND_PROXY_TARGET (default http://localhost:8000)
- npm test
  - Runs tests in CI-friendly non-watch mode
- npm run build
  - Produces production build in build/

## Backend endpoints

The frontend expects the backend to expose endpoints (proxied under /api/* in dev):
- Auth:
  - POST /api/auth/login
  - POST /api/auth/register
- Playlists:
  - GET /api/playlists
  - POST /api/playlists
  - GET /api/playlists/:id
  - PATCH /api/playlists/:id
  - DELETE /api/playlists/:id
- Catalog:
  - GET /api/catalog/search?query=...&genre=...&artist=...&album=...
- Recommendations:
  - GET /api/recommendations
- Streaming:
  - POST /api/stream/start
  - POST /api/stream/stop
- Admin:
  - GET /api/admin/users
  - POST /api/admin/music

These routes are consumed by the API helper modules in src/api/* and by hooks/components throughout the app.

## Proxy notes

- The dev proxy is defined in src/setupProxy.js and uses http-proxy-middleware.
- Default target is http://localhost:8000. Override with BACKEND_PROXY_TARGET env var.
- If you set REACT_APP_API_BASE_URL, axios will call that directly and the proxy is bypassed.

## Customization

- Colors and theme tokens are defined in src/App.css
- No UI framework; components use plain CSS for performance and simplicity

## Troubleshooting

- API 404/401 locally:
  - Verify backend is running and endpoints match the paths above.
  - If bypassing proxy, ensure REACT_APP_API_BASE_URL points to the backend.
  - If using proxy, ensure BACKEND_PROXY_TARGET is correct (or unset to use default).
- CORS issues:
  - Prefer using the CRA proxy in development (leave REACT_APP_API_BASE_URL blank).
  - If calling backend directly, configure CORS on the backend accordingly.
