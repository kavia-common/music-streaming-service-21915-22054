import React from "react";
import { usePlayer } from "../../hooks/usePlayer";

/**
 * PlayerBar - bottom fixed bar with playback controls and track info.
 * Renders only when user is authenticated (parent controls visibility),
 * but it's safe to render otherwise as it doesn't rely on auth state directly.
 */
// PUBLIC_INTERFACE
export default function PlayerBar() {
  /** Bottom player bar component with play/pause/stop and current track info */
  const { currentTrack, isPlaying, error, togglePlay, stop } = usePlayer();

  // Simple compact styling
  return (
    <div
      role="region"
      aria-label="Player controls"
      style={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-secondary)",
        padding: "10px 20px",
        zIndex: 8,
      }}
      className="player-bar"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸ Pause" : "▶️ Play"}
        </button>
        <button
          className="btn"
          onClick={stop}
          aria-label="Stop"
          title="Stop"
          style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
        >
          ⏹ Stop
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {currentTrack ? (
            <>
              <div
                style={{
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentTrack.title || currentTrack.name || "Untitled"}
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
                {currentTrack.artist || currentTrack.artist_name || ""}
                {(currentTrack.artist || currentTrack.artist_name) && (currentTrack.album || currentTrack.album_name)
                  ? " • "
                  : ""}
                {currentTrack.album || currentTrack.album_name || ""}
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.65 }}>No track selected</div>
          )}
        </div>

        {error && (
          <div role="alert" style={{ color: "#b91c1c", fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
