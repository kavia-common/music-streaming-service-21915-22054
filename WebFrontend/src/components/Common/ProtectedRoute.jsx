import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Protects child routes by verifying authentication.
 * If not authenticated, redirects to home with redirect intent.
 */
// PUBLIC_INTERFACE
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !user?.is_admin) {
    // Non-admin trying to access admin route
    return <Navigate to="/" replace />;
  }

  return children;
}
