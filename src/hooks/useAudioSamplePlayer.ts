import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudioSamplePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const stop = useCallback(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio) {
      setPlayingId(null);
      return;
    }

    currentAudio.onplay = null;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio.currentTime = 0;
    audioRef.current = null;
    setPlayingId(null);
  }, []);

  const playSource = useCallback(async (id: string, source: string) => {
    if (!source.trim()) return false;
    stop();

    const audio = new Audio(source);
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.onplay = () => setPlayingId(id);
    audio.onended = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
      setPlayingId((current) => (current === id ? null : current));
    };
    audio.onerror = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
      setPlayingId((current) => (current === id ? null : current));
    };

    try {
      await audio.play();
      return true;
    } catch {
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
      setPlayingId((current) => (current === id ? null : current));
      return false;
    }
  }, [stop]);

  const play = useCallback(async (id: string, url: string) => (
    playSource(id, url)
  ), [playSource]);

  const playDataUri = useCallback(async (id: string, dataUri: string) => (
    playSource(id, dataUri)
  ), [playSource]);

  useEffect(() => stop, [stop]);

  return {
    play,
    playDataUri,
    stop,
    playingId,
  };
}
