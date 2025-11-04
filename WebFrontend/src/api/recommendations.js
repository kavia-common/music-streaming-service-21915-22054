import { http } from "./client";

/**
 * Recommendations API helper functions.
 * Bridges WebFrontend routes (/api/recommendations) to BackendAPI endpoint.
 */

// PUBLIC_INTERFACE
export async function getRecommendations() {
  /** Fetches personalized music recommendations for the current user. */
  return http.get("/api/recommendations");
}
