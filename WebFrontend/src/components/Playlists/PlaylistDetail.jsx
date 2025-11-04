import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addTrackToPlaylist, deletePlaylist, getPlaylist, removeTrackFromPlaylist } from "../../api/playlists";

/**
 * View playlist details, including tracks list, and allow track add/remove and delete playlist.
 * Tracks management assumes backend supports PATCH with add_tracks/remove_tracks arrays.
 */
// PUBLIC_INTERFACE
export default function PlaylistDetail() {
  /** Playlist detail page */
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [pending, setPending] = useState(false);
  const [trackInput, setTrackInput] = useState("");

  const tracks = useMemo(() => playlist?.tracks || [], [playlist]);

  const refresh = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await getPlaylist(id);
      setPlaylist(data);
    } catch (e) {
      setErr(e?.data?.detail || e?.message || "Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onDelete = async () => {
    if (!window.confirm("Delete this playlist? This action cannot be undone.")) return;
    setPending(true);
    setErr("");
    try {
      await deletePlaylist(id);
      navigate("/playlists");
    } catch (e) {
      setErr(e?.data?.detail || e?.message || "Failed to delete playlist");
    } finally {
      setPending(false);
    }
  };

  const onAddTrack = async (e) => {
    e.preventDefault();
    const tid = trackInput.trim();
    if (!tid) return;
    setPending(true);
    setErr("");
    try {
      await addTrackToPlaylist(id, tid);
      setTrackInput("");
      await refresh();
    } catch (e) {
      setErr(e?.data?.detail || e?.message || "Failed to add track");
    } finally {
      setPending(false);
    }
  };

  const onRemoveTrack = async (tid) => {
    if (!tid) return;
    setPending(true);
    setErr("");
    try {
      await removeTrackFromPlaylist(id, tid);
      await refresh();
    } catch (e) {
      setErr(e?.data?.detail || e?.message || "Failed to remove track");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ marginRight: "auto" }}>Playlist</h2>
        <Link to={`/playlists/${id}/edit`} className="btn">Edit</Link>
        <button onClick={onDelete} className="btn" disabled={pending} style={{ background: "#b91c1c" }}>
          Delete
        </button>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {loading && <div>Loading...</div>}
        {err && <div role="alert" style={{ color: "#b91c1c" }}>{err}</div>}
        {!loading && playlist && (
          <>
            <div style={{ display: "flex", gap: 16 }}>
              {playlist.cover_image ? (
                <img src={playlist.cover_image} alt="" width={120} height={120} style={{ objectFit: "cover", borderRadius: 8 }} />
              ) : (
                <div style={{ width: 120, height: 120, background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 8, display: "grid", placeItems: "center", fontSize: 48 }}>🎵</div>
              )}
              <div>
                <h3 style={{ marginTop: 0 }}>{playlist.name}</h3>
                {playlist.description && <div style={{ opacity: 0.8 }}>{playlist.description}</div>}
                <div style={{ opacity: 0.6, fontSize: 14, marginTop: 6 }}>
                  {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4>Tracks</h4>
              {tracks.length === 0 ? (
                <div style={{ opacity: 0.8 }}>No tracks yet. Add a track ID below.</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tracks.map((t) => {
                    const tid = typeof t === "string" ? t : t.id || t.track_id || "";
                    const title = typeof t === "string" ? t : (t.title || t.name || tid);
                    const artist = typeof t === "string" ? "" : (t.artist || t.artist_name || "");
                    return (
                      <li key={tid} style={{ padding: "8px 0", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{title}</div>
                          {artist && <div style={{ opacity: 0.7, fontSize: 14 }}>{artist}</div>}
                        </div>
                        <button className="btn" style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }} onClick={() => onRemoveTrack(tid)} disabled={pending}>
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <form onSubmit={onAddTrack} style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                  aria-label="track-id"
                  placeholder="Enter track ID to add"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  style={{ flex: 1, padding: 8 }}
                />
                <button className="btn" type="submit" disabled={pending}>Add track</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
