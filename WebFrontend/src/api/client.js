import axios from "axios";

/**
 * API client for the WebFrontend
 * - Base URL from REACT_APP_API_BASE_URL (or same-origin for CRA proxy)
 * - Authorization header is managed via setAuthToken(token) which sets Bearer <token>
 * - Centralized response error normalization
 */
const baseURL = process.env.REACT_APP_API_BASE_URL || "";

const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// PUBLIC_INTERFACE
export function setAuthToken(token) {
  /**
   * Sets or clears the Authorization header (Bearer) on the shared axios instance.
   * Ensure the backend receives: Authorization: Bearer <JWT>
   */
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  get: (url, config = {}) => api.get(url, config).then((r) => r.data),
  post: (url, data, config = {}) => api.post(url, data, config).then((r) => r.data),
  put: (url, data, config = {}) => api.put(url, data, config).then((r) => r.data),
  patch: (url, data, config = {}) => api.patch(url, data, config).then((r) => r.data),
  delete: (url, config = {}) => api.delete(url, config).then((r) => r.data),
};

export default api;
