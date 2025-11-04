import React from "react";

/**
 * SearchResults displays a list of results and pagination controls.
 * Props:
 * - results: array of catalog items
 * - page: current page (number)
 * - pageSize: items per page
 * - total: total results (optional; if undefined, show 'Next' if results.length === pageSize)
 * - loading: boolean
 * - error: string
 * - onPrev: function()
 * - onNext: function()
 * - onAddToPlaylist: function(item) placeholder handler
 */
// PUBLIC_INTERFACE
export default function SearchResults({
  results = [],
  page = 1,
  pageSize = 10,
  total,
  loading = false,
  error = "",
  onPrev,
  onNext,
  onAddToPlaylist,
}) {
  /** Catalog search results list with pagination */
  const canPrev = page > 1;
  const hasPageSize = Number.isFinite(pageSize) && pageSize > 0;
  const canNext = typeof total === "number" ? page * pageSize < total : (hasPageSize ? results.length === pageSize : results.length > 0);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      {loading && <div>Searching...</div>}
      {error && (
        <div role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div>No results found.</div>
      )}

      {!loading && !error && results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {results.map((item) => {
            const id = item.id || item.track_id || item.uuid || `${item.artist || ""}-${item.title || item.name || ""}`;
            const title = item.title || item.name || "Untitled";
            const artist = item.artist || item.artist_name || "";
            const album = item.album || item.album_name || "";
            const duration = item.duration || null;
            const cover = item.cover_image || item.image || null;
            return (
              <li key={id} style={{ padding: "10px 6px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {cover ? (
                    <img src={cover} alt="" width={44} height={44} style={{ objectFit: "cover", borderRadius: 8 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 8, display: "grid", placeItems: "center", fontSize: 18 }}>🎵</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                    <div style={{ opacity: 0.75, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {artist}{artist && album ? " • " : ""}{album}{duration ? ` • ${formatDuration(duration)}` : ""}
                    </div>
                  </div>
                  <button
                    className="btn"
                    style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                    onClick={() => typeof onAddToPlaylist === "function" && onAddToPlaylist(item)}
                    aria-label={`Add ${title} to a playlist`}
                  >
                    ➕ Add to playlist
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <button className="btn" disabled={!canPrev} onClick={onPrev} style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}>
          ← Previous
        </button>
        <div style={{ opacity: 0.8 }}>Page {page}</div>
        <button className="btn" disabled={!canNext} onClick={onNext}>
          Next →
        </button>
        {typeof total === "number" && (
          <div style={{ marginLeft: "auto", opacity: 0.7, fontSize: 14 }}>
            {Math.min(page * pageSize, total)} of {total}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(sec) {
  if (!sec || !Number.isFinite(sec)) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
