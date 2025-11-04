//
// API client for the WebFrontend
// Uses axios with:
// - Base URL from REACT_APP_API_BASE_URL
// - Authorization header derived from the current auth token via useAuth()
// - Graceful error handling and helper HTTP methods
//
import axios from "axios";

/**
 * Reads API base URL from environment.
 * If not provided, falls back to same-origin (empty string) so CRA proxy can be used in dev.
 */
const baseURL = process.env.REACT_APP_API_BASE_URL || "";

// Create axios instance
const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// PUBLIC_INTERFACE
export function setAuthToken(token) {
  /** Sets or clears the Authorization header (Bearer) on the shared axios instance. */
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Attach an interceptor to log responses in dev and surface errors consistently.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error shape
    const normalized = {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message || "Unknown error",
    };
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[API ERROR]", normalized);
    }
    return Promise.reject(normalized);
  }
);

// PUBLIC_INTERFACE
export const http = {
  /** Performs GET request */
  get: (url, config = {}) => api.get(url, config).then((r) => r.data),
  /** Performs POST request */
  post: (url, data, config = {}) => api.post(url, data, config).then((r) => r.data),
  /** Performs PUT request */
  put: (url, data, config = {}) => api.put(url, data, config).then((r) => r.data),
  /** Performs PATCH request */
  patch: (url, data, config = {}) => api.patch(url, data, config).then((r) => r.data),
  /** Performs DELETE request */
  delete: (url, config = {}) => api.delete(url, config).then((r) => r.data),
};

export default api;
