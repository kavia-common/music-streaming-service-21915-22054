import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import PlaylistList from "./components/Playlists/PlaylistList";
import PlaylistDetail from "./components/Playlists/PlaylistDetail";
import PlaylistEditor from "./components/Playlists/PlaylistEditor";
import SearchBar from "./components/Catalog/SearchBar";
import SearchResults from "./components/Catalog/SearchResults";
import { searchCatalog, addTrackToPlaylistPlaceholder } from "./api/catalog";
import RecommendationsPanel from "./components/Recommendations/RecommendationsPanel";
import PlayerBar from "./components/Player/PlayerBar";
import { usePlayer } from "./hooks/usePlayer";
import UserAdmin from "./components/Admin/UserAdmin";
import MusicAdmin from "./components/Admin/MusicAdmin";

// Placeholder pages (scaffold only)
function Home() {
  const { isAuthenticated } = useAuth();
  const { playTrack } = usePlayer();

  // Real play handler using the streaming controller
  const onPlay = async (item) => {
    await playTrack(item);
  };

  // Reuse placeholder add-to-playlist logic similar to Search page
  const onAddToPlaylist = async (item) => {
    const pid = window.prompt("Enter playlist ID to add this track to:");
    if (!pid) return;
    const trackId = item.id || item.track_id || item.uuid || item.title || "";
    try {
      await addTrackToPlaylistPlaceholder(pid, trackId);
      window.alert("Track added to playlist (placeholder).");
    } catch (e) {
      window.alert(e?.data?.detail || e?.message || "Failed to add track.");
    }
  };

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
        <>
          <RecommendationsPanel onPlay={onPlay} onAddToPlaylist={onAddToPlaylist} />
        </>
      )}
    </div>
  );
}

function Search() {
  const [params, setParams] = React.useState({ query: "", genre: "", artist: "", album: "" });
  const [results, setResults] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [total, setTotal] = React.useState(undefined);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  const performSearch = async (override = {}) => {
    const nextParams = { ...params, ...override };
    // Reset to first page when filters change
    const nextPage = override && Object.keys(override).length > 0 ? 1 : page;
    if (!nextParams.query?.trim()) {
      setResults([]);
      setTotal(undefined);
      setErr("");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const data = await searchCatalog({ ...nextParams, page: nextPage, pageSize });
      // The backend may return { items, total } or just an array. Normalize.
      const items = Array.isArray(data) ? data : (data.items || data.results || []);
      const t = typeof data?.total === "number" ? data.total : undefined;
      setResults(items);
      setTotal(t);
      setParams(nextParams);
      setPage(nextPage);
    } catch (e) {
      setErr(e?.data?.detail || e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (newParams) => {
    performSearch(newParams);
  };

  const onPrev = () => {
    if (page <= 1) return;
    setPage((p) => p - 1);
    performSearch();
  };

  const onNext = () => {
    setPage((p) => p + 1);
    performSearch();
  };

  const onAddToPlaylist = async (item) => {
    // Placeholder UX: show prompt for playlist ID and call placeholder API.
    const pid = window.prompt("Enter playlist ID to add this track to:");
    if (!pid) return;
    const trackId = item.id || item.track_id || item.uuid || item.title || "";
    try {
      await addTrackToPlaylistPlaceholder(pid, trackId);
      window.alert("Track added to playlist (placeholder).");
    } catch (e) {
      window.alert(e?.data?.detail || e?.message || "Failed to add track.");
    }
  };

  return (
    <div className="container">
      <h2>Search</h2>
      <SearchBar initial={params} onSearch={onSearch} />
      <SearchResults
        results={results}
        page={page}
        pageSize={pageSize}
        total={total}
        loading={loading}
        error={err}
        onPrev={onPrev}
        onNext={onNext}
        onAddToPlaylist={onAddToPlaylist}
      />
    </div>
  );
}

function Admin() {
  return (
    <div className="container">
      <h2>Admin</h2>
      <UserAdmin />
      <MusicAdmin />
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

      {isAuthenticated && <PlayerBar />}

      <footer className="footer container">
        <span>© {new Date().getFullYear()} Music Streaming Service</span>
      </footer>
    </div>
  );
}

export default App;
