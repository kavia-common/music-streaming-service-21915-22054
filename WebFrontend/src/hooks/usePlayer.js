/**
 * usePlayer - Hook providing audio playback state and controls.
 * Responsibilities:
 * - Manage an <audio> element instance and its lifecycle.
 * - Track currentTrack, isPlaying, and active streaming sessionId.
 * - Call POST /api/stream/start with { trackId } to get { stream_url, session_id }.
 * - Set audio.src to stream_url and play.
 * - On pause/stop/unmount, call POST /api/stream/stop with { sessionId }.
 * - Expose { currentTrack, isPlaying, error, playTrack, togglePlay, stop, audioRef }.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startStream, stopStream } from "../api/streaming";

// Resolve a trackId from various item shapes
function resolveTrackId(track) {
  if (!track) return null;
  return (
    track.id ||
    track.track_id ||
    track.uuid ||
    track.title || // fallback for placeholder items
    null
  );
}

// PUBLIC_INTERFACE
export function usePlayer() {
  /** Hook managing the streaming audio player and backend session lifecycle. */
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");

  // Lazily create a single HTMLAudioElement instance
  useEffect(() => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "metadata";
      el.crossOrigin = "anonymous"; // allow CORS if needed
      // Attach listeners to sync isPlaying
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onEnded = () => setIsPlaying(false);
      const onError = () => setError("Audio playback error");
      el.addEventListener("play", onPlay);
      el.addEventListener("pause", onPause);
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onError);
      audioRef.current = el;

      setAudioReady(true);

      return () => {
        el.removeEventListener("play", onPlay);
        el.removeEventListener("pause", onPause);
        el.removeEventListener("ended", onEnded);
        el.removeEventListener("error", onError);
        try {
          el.pause();
        } catch (_) {
          // ignore
        }
      };
    }
  }, []);

  // Cleanup on unmount: stop active session
  useEffect(() => {
    return () => {
      if (sessionId) {
        // Best-effort async stop; no await on unmount
        stopStream(sessionId).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const stop = useCallback(async () => {
    /** Stop playback and close backend session */
    setError("");
    try {
      const el = audioRef.current;
      if (el) {
        try {
          el.pause();
          el.src = "";
          el.load();
        } catch (_) {
          // ignore
        }
      }
      if (sessionId) {
        await stopStream(sessionId);
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error("[Player stop error]", e);
      setError(e?.data?.detail || e?.message || "Failed to stop stream");
    } finally {
      setSessionId(null);
      setIsPlaying(false);
    }
  }, [sessionId]);

  const playTrack = useCallback(
    async (track) => {
      /**
       * Start playing the provided track:
       * - Stops any existing session
       * - Requests new stream URL
       * - Sets audio.src and plays
       * Backend response fields used: { stream_url, session_id }
       */
      setError("");
      const tid = resolveTrackId(track);
      if (!tid) {
        setError("Invalid track");
        return { ok: false, error: "Invalid track" };
      }

      // Stop existing session if any
      try {
        if (sessionId) {
          await stopStream(sessionId);
          setSessionId(null);
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[Player] Failed to stop previous session", e);
        }
      }

      try {
        const data = await startStream(String(tid));
        // Backend canonical: stream_url (primary), session_id (primary)
        const streamUrl = data?.stream_url || data?.url || data?.streamUrl;
        const sid = data?.session_id ?? data?.sessionId ?? null;
        if (!streamUrl) {
          throw { message: "No stream URL returned", data, status: 500 };
        }
        setCurrentTrack(track);
        setSessionId(sid);

        const el = audioRef.current;
        if (!el) throw { message: "Audio element not ready" };
        el.src = streamUrl;
        await el.play();
        setIsPlaying(true);

        return { ok: true, sessionId: sid, streamUrl };
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error("[Player playTrack error]", e);
        setError(e?.data?.detail || e?.message || "Failed to start stream");
        setIsPlaying(false);
        return { ok: false, error: e };
      }
    },
    [sessionId]
  );

  const togglePlay = useCallback(async () => {
    /**
     * Toggle play/pause.
     * - If no track loaded yet, do nothing.
     * - On pause, stop backend session to free resources.
     */
    setError("");
    const el = audioRef.current;
    if (!el || !el.src) return;

    if (el.paused) {
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        setError("Unable to resume playback");
      }
    } else {
      try {
        el.pause();
        setIsPlaying(false);
        if (sessionId) {
          await stopStream(sessionId);
          setSessionId(null);
        }
      } catch {
        setError("Unable to pause playback");
      }
    }
  }, [sessionId]);

  return useMemo(
    () => ({
      audioRef,
      audioReady,
      currentTrack,
      isPlaying,
      error,
      playTrack,
      togglePlay,
      stop,
    }),
    [audioReady, currentTrack, isPlaying, error, playTrack, togglePlay, stop]
  );
}
