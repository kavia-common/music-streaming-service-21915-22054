import { http } from "./client";

/**
 * Auth API helper functions.
 * Bridges WebFrontend routes (/api/auth/*) to BackendAPI endpoints (/auth/*).
 * Uses the shared axios client to benefit from baseURL and interceptors.
 * Note: Token normalization is handled in useAuth.login (token or access_token).
 */

// PUBLIC_INTERFACE
export async function apiLogin(credentials) {
  /** Performs login request against BackendAPI and returns backend response data. */
  return http.post("/api/auth/login", credentials);
}

// PUBLIC_INTERFACE
export async function apiRegister(payload) {
  /** Performs registration request against BackendAPI and returns backend response. */
  return http.post("/api/auth/register", payload);
}
