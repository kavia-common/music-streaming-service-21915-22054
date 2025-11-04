import { http } from "./client";

/**
 * Admin API helpers for listing users and adding music.
 * These call the backend via CRA proxy under /api/admin/* and require Authorization header set by AuthProvider.
 */

// PUBLIC_INTERFACE
export async function getAdminUsers({ page = 1, pageSize = 10 } = {}) {
  /** Fetch paginated list of users for admin dashboard. Returns { items, total } or an array fallback. */
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (pageSize) params.set("page_size", String(pageSize));
  return http.get(`/api/admin/users?${params.toString()}`);
}

// PUBLIC_INTERFACE
export async function createMusicTrack({ title, artist, album, genre, duration }) {
  /** Create a new music track as admin. Expects { title, artist, album, genre, duration }. */
  const payload = {
    title: title?.trim(),
    artist: artist?.trim(),
    album: album?.trim() || null,
    genre: genre?.trim() || null,
    duration: typeof duration === "number" ? duration : Number(duration),
  };
  return http.post("/api/admin/music", payload);
}
