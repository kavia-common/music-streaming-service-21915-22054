import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPlaylists } from "../../api/playlists";

/**
 * Displays a list of the user's playlists with navigation to create, view, and edit.
 */
// PUBLIC_INTERFACE
export default function PlaylistList() {
  /** Playlist index page showing user's playlists */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await listPlaylists();
        if (mounted) setItems(Array.isArray(data) ? data : (data?.items || []));
      } catch (e) {
        setErr(e?.data?.detail || e?.message || "Failed to load playlists");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ marginRight: "auto" }}>Your Playlists</h2>
        <Link to="/playlists/new" className="btn">➕ New Playlist</Link>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {loading && <div>Loading...</div>}
        {err && (
          <div role="alert" style={{ color: "#b91c1c" }}>
            {err}
          </div>
        )}

        {!loading && !err && items.length === 0 && (
          <div>No playlists yet. Create your first one.</div>
        )}

        {!loading && !err && items.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((p) => (
              <li key={p.id} style={{ padding: "10px 6px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {p.cover_image ? (
                    <img src={p.cover_image} alt="" width={44} height={44} style={{ objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 8, display: "grid", placeItems: "center", fontSize: 20 }}>🎵</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.description && <div style={{ opacity: 0.7, fontSize: 14 }}>{p.description}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to={`/playlists/${p.id}`} className="btn" style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}>View</Link>
                    <Link to={`/playlists/${p.id}/edit`} className="btn">Edit</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
