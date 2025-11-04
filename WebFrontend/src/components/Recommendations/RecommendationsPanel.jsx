import React, { useEffect, useState } from "react";
import { getRecommendations } from "../../api/recommendations";

/**
 * RecommendationsPanel fetches and displays personalized recommendations.
 * Props:
 * - onPlay?: function(item) -> called when user presses play
 * - onAddToPlaylist?: function(item) -> called when user adds a track to a playlist
 */
// PUBLIC_INTERFACE
export default function RecommendationsPanel({ onPlay, onAddToPlaylist }) {
  /** Displays a card with recommended tracks for the user */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getRecommendations();
        // Normalize array response from various shapes
        const list = Array.isArray(data) ? data : (data?.items || data?.results || []);
        if (mounted) setItems(list);
      } catch (e) {
        if (mounted) setErr(e?.data?.detail || e?.message || "Failed to load recommendations");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePlay = (item) => {
    if (typeof onPlay === "function") return onPlay(item);
    // Basic placeholder action until a streaming controller exists
    const title = item.title || item.name || "track";
    window.alert(`Play "${title}" (placeholder)`);
  };

  const handleAddToPlaylist = (item) => {
    if (typeof onAddToPlaylist === "function") return onAddToPlaylist(item);
    // Fallback placeholder: prompt for playlist ID
    const pid = window.prompt("Enter playlist ID to add this track to:");
    if (!pid) return;
    const trackId = item.id || item.track_id || item.uuid || item.title || "";
    // In a later iteration, wire to real playlist add API from playlists.js
    window.alert(`Added "${item.title || item.name || trackId}" to playlist ${pid} (placeholder).`);
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
        <h3 style={{ margin: 0, marginRight: "auto" }}>Recommended for you</h3>
      </div>

      {loading && <div>Loading recommendations...</div>}
      {err && (
        <div role="alert" style={{ color: "#b91c1c" }}>
          {err}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div>No recommendations available right now. Try playing some tracks to improve suggestions.</div>
      )}

      {!loading && !err && items.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item, idx) => {
            const id = item.id || item.track_id || item.uuid || `${item.artist || ""}-${item.title || item.name || idx}`;
            const title = item.title || item.name || "Untitled";
            const artist = item.artist || item.artist_name || "";
            const album = item.album || item.album_name || "";
            const duration = item.duration || null;
            const cover = item.cover_image || item.image || null;

            return (
              <li key={id} style={{ padding: "10px 6px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      width={44}
                      height={44}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: 8,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 18,
                      }}
                    >
                      🎵
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        opacity: 0.75,
                        fontSize: 14,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {artist}
                      {artist && album ? " • " : ""}
                      {album}
                      {duration ? ` • ${formatDuration(duration)}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn"
                      style={{
                        background: "transparent",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                      }}
                      onClick={() => handlePlay(item)}
                      aria-label={`Play ${title}`}
                    >
                      ▶️ Play
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleAddToPlaylist(item)}
                      aria-label={`Add ${title} to a playlist`}
                    >
                      ➕ Add
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatDuration(sec) {
  if (!sec || !Number.isFinite(sec)) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
