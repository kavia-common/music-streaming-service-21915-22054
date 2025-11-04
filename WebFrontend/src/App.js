import React, { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

// Placeholder pages (scaffold only)
function Home() {
  const { isAuthenticated, login, logout, loading } = useAuth();
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password");

  return (
    <div className="container">
      <h1>Music Streaming</h1>
      <p className="card">Welcome to the platform. Use the nav to explore.</p>

      {!isAuthenticated ? (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Quick Login (scaffold)</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              aria-label="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              aria-label="password"
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn" disabled={loading} onClick={() => login(email, password)}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 16 }}>
          <p>You are logged in.</p>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}

function Search() {
  return (
    <div className="container">
      <h2>Search</h2>
      <p className="card">Search UI will be implemented later.</p>
    </div>
  );
}

function Playlist() {
  return (
    <div className="container">
      <h2>Playlists</h2>
      <p className="card">Playlists UI will be implemented later.</p>
    </div>
  );
}

function Admin() {
  return (
    <div className="container">
      <h2>Admin</h2>
      <p className="card">Admin interface will be implemented later.</p>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");
  const { isAuthenticated } = useAuth();

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className="App">
      <nav className="navbar">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
          Home
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Search
        </NavLink>
        <NavLink to="/playlists" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Playlists
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Admin
        </NavLink>
        <div className="nav-spacer" />
        <span style={{ opacity: 0.7, fontSize: 14 }}>
          {isAuthenticated ? "Authenticated" : "Guest"}
        </span>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <Playlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div className="container">Not found</div>} />
      </Routes>

      <footer className="footer container">
        <span>© {new Date().getFullYear()} Music Streaming Service</span>
      </footer>
    </div>
  );
}

export default App;
