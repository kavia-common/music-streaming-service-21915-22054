import { http } from "./client";

/**
 * Streaming API helpers to start and stop playback sessions.
 * Bridges WebFrontend routes (/api/stream/*) to BackendAPI endpoints.
 */

// PUBLIC_INTERFACE
export async function startStream(trackId) {
  /** Starts a streaming session for a track and returns { stream_url, session_id, ... } */
  if (!trackId) {
    throw { status: 400, message: "trackId is required" };
  }
  return http.post("/api/stream/start", { trackId });
}

// PUBLIC_INTERFACE
export async function stopStream(sessionId) {
  /** Stops an existing streaming session for cleanup. Accepts null and resolves gracefully. */
  if (!sessionId) return { ok: true };
  return http.post("/api/stream/stop", { sessionId });
}
