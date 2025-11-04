import { http } from "./client";

/**
 * Catalog API helpers for search and actions on catalog items.
 * Bridges WebFrontend routes (/api/catalog/*) to BackendAPI endpoints (/catalog/*).
 */

// PUBLIC_INTERFACE
export async function searchCatalog({ query, genre, artist, album, page = 1, pageSize = 10 }) {
  /** Performs catalog search with optional filters and pagination basics. */
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (genre) params.set("genre", genre);
  if (artist) params.set("artist", artist);
  if (album) params.set("album", album);
  // Backend may support pagination via page/limit or offset/limit; we pass common page/page_size.
  if (page) params.set("page", String(page));
  if (pageSize) params.set("page_size", String(pageSize));

  return http.get(`/api/catalog/search?${params.toString()}`);
}

// PUBLIC_INTERFACE
export async function addTrackToPlaylistPlaceholder(playlistId, trackId) {
  /**
   * Placeholder action to simulate adding a catalog result to a playlist.
   * The actual implementation will be wired once backend endpoint is available.
   */
  // For now, just resolve a success structure to allow UI feedback.
  return Promise.resolve({ ok: true, playlistId, trackId });
}
