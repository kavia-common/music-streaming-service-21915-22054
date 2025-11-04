import React, { useState } from "react";
import { createMusicTrack } from "../../api/admin";

/**
 * MusicAdmin - Simple form to add music tracks as admin.
 * Fields: title (required), artist (required), album, genre, duration (seconds).
 */
// PUBLIC_INTERFACE
export default function MusicAdmin() {
  /** Renders admin music track creation form */
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!title.trim() || !artist.trim()) {
      setErr("Title and Artist are required");
      return;
    }
    setSaving(true);
    try {
      await createMusicTrack({
        title,
        artist,
        album,
        genre,
        duration: duration ? Number(duration) : undefined,
      });
      setOk("Track created successfully");
      setTitle("");
      setArtist("");
      setAlbum("");
      setGenre("");
      setDuration("");
    } catch (e2) {
      setErr(e2?.data?.detail || e2?.message || "Failed to create track");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Add Music Track</h3>

      {err && (
        <div role="alert" style={{ color: "#b91c1c", marginBottom: 10 }}>
          {err}
        </div>
      )}
      {ok && (
        <div
          role="status"
          style={{
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.35)",
            color: "#065f46",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 14,
            marginBottom: 10,
          }}
        >
          {ok}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        <label>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Title</div>
          <input
            aria-label="title"
            placeholder="Song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Artist</div>
          <input
            aria-label="artist"
            placeholder="Artist name"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <label>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Album</div>
            <input
              aria-label="album"
              placeholder="Album name"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Genre</div>
            <input
              aria-label="genre"
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Duration (sec)</div>
            <input
              aria-label="duration"
              type="number"
              min="0"
              placeholder="e.g. 210"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create track"}
          </button>
        </div>
      </form>
    </div>
  );
}
