import React, { useEffect, useState } from "react";

/**
 * SearchBar collects search filters and triggers onSearch with the parameters.
 * Props:
 * - initial: { query, genre, artist, album }
 * - onSearch: function(params)
 */
// PUBLIC_INTERFACE
export default function SearchBar({ initial = {}, onSearch }) {
  /** SearchBar filters UI */
  const [query, setQuery] = useState(initial.query || "");
  const [genre, setGenre] = useState(initial.genre || "");
  const [artist, setArtist] = useState(initial.artist || "");
  const [album, setAlbum] = useState(initial.album || "");

  useEffect(() => {
    setQuery(initial.query || "");
    setGenre(initial.genre || "");
    setArtist(initial.artist || "");
    setAlbum(initial.album || "");
  }, [initial.query, initial.genre, initial.artist, initial.album]);

  const submit = (e) => {
    e.preventDefault();
    if (typeof onSearch === "function") {
      onSearch({ query: query.trim(), genre: genre.trim(), artist: artist.trim(), album: album.trim() });
    }
  };

  const clearFilters = () => {
    setQuery("");
    setGenre("");
    setArtist("");
    setAlbum("");
    if (typeof onSearch === "function") {
      onSearch({ query: "", genre: "", artist: "", album: "" });
    }
  };

  return (
    <form onSubmit={submit} className="card" style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Query</div>
          <input
            aria-label="query"
            placeholder="Song title, artist, album..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        <label>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Genre</div>
          <input
            aria-label="genre"
            placeholder="e.g. Pop"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Artist</div>
          <input
            aria-label="artist"
            placeholder="e.g. Dua Lipa"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Album</div>
          <input
            aria-label="album"
            placeholder="e.g. Future Nostalgia"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button type="submit" className="btn">Search</button>
        <button type="button" className="btn" style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }} onClick={clearFilters}>
          Clear
        </button>
      </div>
    </form>
  );
}
