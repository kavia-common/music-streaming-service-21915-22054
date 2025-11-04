import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Registration form component.
 * - Collects username, email, password
 * - Calls useAuth.register which posts to /api/auth/register
 * - On success, navigates to /login
 */
// PUBLIC_INTERFACE
export default function RegisterForm() {
  /** User registration form */
  const { register, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setOkMsg("");
    const res = await register(email.trim(), password, username.trim());
    if (res.ok) {
      setOkMsg("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } else {
      const status = res.error?.status;
      const message =
        res.error?.data?.detail ||
        res.error?.data?.message ||
        res.error?.message ||
        "Registration failed";
      setErrMsg(status ? `${status}: ${message}` : message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h2>Create your account</h2>
      <div className="card" style={{ marginTop: 12 }}>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Username</div>
            <input
              aria-label="username"
              type="text"
              required
              placeholder="Display name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
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
              placeholder="Create a strong password"
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

          {okMsg && (
            <div
              role="status"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.35)",
                color: "#065f46",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 14,
              }}
            >
              {okMsg}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <div style={{ marginTop: 10, fontSize: 14 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
