# Admin Components

- UserAdmin.jsx: Lists users with simple pagination by calling `/api/admin/users`.
- MusicAdmin.jsx: Simple form to add new music tracks by POSTing to `/api/admin/music`.

These routes are protected via `<ProtectedRoute requireAdmin>` in `App.js`. The auth token is automatically attached via the shared axios client configured in `hooks/useAuth` -> `setAuthToken`.
