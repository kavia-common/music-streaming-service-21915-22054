import { http } from "./client";

/**
 * Playlist API helper functions.
 * Bridges WebFrontend routes (/api/playlists/*) to BackendAPI endpoints (/playlists/*).
 * Uses the shared axios client for auth header and baseURL handling.
 */

// PUBLIC_INTERFACE
export async function listPlaylists() {
  /** Fetches the current user's playlists. Returns an array of playlist summaries. */
  return http.get("/api/playlists");
}

// PUBLIC_INTERFACE
export async function createPlaylist(payload) {
  /** Creates a playlist with fields: { name, description, cover_image }. Returns the created playlist. */
  return http.post("/api/playlists", payload);
}

// PUBLIC_INTERFACE
export async function getPlaylist(id) {
  /** Retrieves full playlist details by ID, including tracks if provided by backend. */
  return http.get(`/api/playlists/${encodeURIComponent(id)}`);
}

// PUBLIC_INTERFACE
export async function updatePlaylist(id, payload) {
  /** Updates playlist metadata: { name?, description?, cover_image? } */
  // Prefer PATCH for partial updates; if backend only supports PUT, adjust accordingly.
  return http.patch(`/api/playlists/${encodeURIComponent(id)}`, payload);
}

// PUBLIC_INTERFACE
export async function deletePlaylist(id) {
  /** Deletes a playlist by ID. */
  return http.delete(`/api/playlists/${encodeURIComponent(id)}`);
}

// PUBLIC_INTERFACE
export async function addTrackToPlaylist(id, trackId) {
  /** Adds a track to the playlist. Backend convention assumed: PATCH with { add_tracks: [trackId] } */
  return http.patch(`/api/playlists/${encodeURIComponent(id)}`, { add_tracks: [trackId] });
}

// PUBLIC_INTERFACE
export async function removeTrackFromPlaylist(id, trackId) {
  /** Removes a track from the playlist. Backend convention assumed: PATCH with { remove_tracks: [trackId] } */
  return http.patch(`/api/playlists/${encodeURIComponent(id)}`, { remove_tracks: [trackId] });
}
