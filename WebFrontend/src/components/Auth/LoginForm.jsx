import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Login form component.
 * - Collects email/password
 * - Calls useAuth.login which posts to /api/auth/login
 * - On success, redirects to intended route or home
 */
// PUBLIC_INTERFACE
export default function LoginForm() {
  /** Login form for user authentication */
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    const res = await login(email.trim(), password);
    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      const status = res.error?.status;
      const message =
        res.error?.data?.detail ||
        res.error?.data?.message ||
        res.error?.message ||
        "Login failed";
      setErrMsg(status ? `${status}: ${message}` : message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>Login</h2>
      <div className="card" style={{ marginTop: 12 }}>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Email</div>
            <input
              aria-label="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Password</div>
            <input
              aria-label="password"
              type="password"
              required
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          {errMsg && (
            <div
              role="alert"
              style={{
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.3)",
                color: "#b91c1c",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 14,
              }}
            >
              {errMsg}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div style={{ marginTop: 10, fontSize: 14 }}>
          No account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
