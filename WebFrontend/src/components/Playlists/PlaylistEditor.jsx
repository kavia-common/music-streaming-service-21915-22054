import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPlaylist, getPlaylist, updatePlaylist } from "../../api/playlists";

/**
 * Playlist editor form. Used for both create and edit flows.
 * - Fields: name (required), description, cover_image (URL)
 */
// PUBLIC_INTERFACE
export default function PlaylistEditor() {
  /** Playlist create/edit form page */
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getPlaylist(id);
        if (!mounted) return;
        setName(data?.name || "");
        setDescription(data?.description || "");
        setCoverImage(data?.cover_image || data?.coverImage || "");
      } catch (e) {
        setErr(e?.data?.detail || e?.message || "Failed to load playlist");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Name is required");
      return;
    }
    setSaving(true);
    setErr("");
    const payload = {
      name: name.trim(),
      description: description.trim(),
      cover_image: coverImage.trim() || null,
    };
    try {
      if (isEdit) {
        await updatePlaylist(id, payload);
        navigate(`/playlists/${id}`);
      } else {
        const created = await createPlaylist(payload);
        const newId = created?.id || created?.playlist_id || created?.uuid;
        navigate(newId ? `/playlists/${newId}` : "/playlists");
      }
    } catch (e) {
      setErr(e?.data?.detail || e?.message || "Failed to save playlist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h2>{isEdit ? "Edit Playlist" : "New Playlist"}</h2>
      <div className="card" style={{ marginTop: 12 }}>
        {loading && <div>Loading...</div>}
        {err && <div role="alert" style={{ color: "#b91c1c", marginBottom: 10 }}>{err}</div>}
        {!loading && (
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label>
              <div style={{ fontSize: 14, marginBottom: 4 }}>Name</div>
              <input
                aria-label="name"
                type="text"
                required
                placeholder="My great playlist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <label>
              <div style={{ fontSize: 14, marginBottom: 4 }}>Description</div>
              <textarea
                aria-label="description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <label>
              <div style={{ fontSize: 14, marginBottom: 4 }}>Cover Image URL</div>
              <input
                aria-label="cover-image"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            {coverImage && (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 14, marginBottom: 6, opacity: 0.8 }}>Preview</div>
                <img
                  src={coverImage}
                  alt="Cover preview"
                  style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-color)" }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Save changes" : "Create playlist"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
