# Recommendations Components

- RecommendationsPanel.jsx: Fetches `/api/recommendations` and displays a list of recommended tracks with "Play" and "Add" actions.
- Integrates into Home page for authenticated users.

Future wiring:
- Replace the play placeholder with a POST to `/api/stream/start` when streaming is implemented.
- Replace the add-to-playlist prompt with a UI to pick a playlist and call the real playlist API.
