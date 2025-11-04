import { http } from "./client";

/**
 * Auth API helper functions.
 * Bridges WebFrontend routes (/api/auth/*) to BackendAPI endpoints (/auth/*).
 * Uses the shared axios client to benefit from baseURL and interceptors.
 */

// PUBLIC_INTERFACE
export async function apiLogin(credentials) {
  /** Performs login request against BackendAPI and returns normalized data. */
  // BackendAPI path is /auth/login (proxied as /api/auth/login via CRA dev proxy)
  return http.post("/api/auth/login", credentials);
}

// PUBLIC_INTERFACE
export async function apiRegister(payload) {
  /** Performs registration request against BackendAPI and returns backend response. */
  // BackendAPI path is /auth/register (proxied as /api/auth/register via CRA dev proxy)
  return http.post("/api/auth/register", payload);
}
