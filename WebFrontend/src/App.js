import React, { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import PlaylistList from "./components/Playlists/PlaylistList";
import PlaylistDetail from "./components/Playlists/PlaylistDetail";
import PlaylistEditor from "./components/Playlists/PlaylistEditor";

// Placeholder pages (scaffold only)
function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container">
      <h1>Music Streaming</h1>
      <p className="card">Welcome to the platform. Use the nav to explore.</p>

      {!isAuthenticated ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p>
            You are currently browsing as a guest. Please{" "}
            <NavLink to="/login">log in</NavLink> or{" "}
            <NavLink to="/register">create an account</NavLink> to access all features.
          </p>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 16 }}>
          <p>You are logged in.</p>
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
        {!isAuthenticated ? (
          <>
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Login
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Register
            </NavLink>
          </>
        ) : (
          <span style={{ opacity: 0.7, fontSize: 14 }}>Account</span>
        )}
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
              <PlaylistList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists/new"
          element={
            <ProtectedRoute>
              <PlaylistEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists/:id"
          element={
            <ProtectedRoute>
              <PlaylistDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists/:id/edit"
          element={
            <ProtectedRoute>
              <PlaylistEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            /* Note: Admin remains protected and placeholder for now */
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="*" element={<div className="container">Not found</div>} />
      </Routes>

      <footer className="footer container">
        <span>© {new Date().getFullYear()} Music Streaming Service</span>
      </footer>
    </div>
  );
}

export default App;
