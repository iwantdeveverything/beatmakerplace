'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Beat } from '../../beats/domain/beat.entity';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

export interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  destroy?: () => void;
}

interface PlayerContextType {
  currentBeat: Beat | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playlist: Beat[];
  playBeat: (beat: Beat, playlist?: Beat[]) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<Beat[]>([]);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);

  const playerRef = useRef<YTPlayerInstance | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize YouTube IFrame API script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady();
      setIsApiReady(true);
    };
  }, []);

  // Initialize YT.Player once API is ready
  useEffect(() => {
    if (!isApiReady || playerRef.current || !window.YT) return;

    try {
      playerRef.current = new window.YT.Player('yt-player-headless', {
        height: '1',
        width: '1',
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume);
          },
          onStateChange: (event) => {
            if (!window.YT) return;
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsBuffering(false);
            } else if (state === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (state === window.YT.PlayerState.BUFFERING) {
              setIsBuffering(true);
            } else if (state === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setIsBuffering(false);
              playNext();
            }
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize YouTube Player:', e);
    }
  }, [isApiReady, volume]);

  // Polling for progress bar
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const current = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(current);
          if (dur > 0 && dur !== duration) {
            setDuration(dur);
          }
        }
      }, 250);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, duration]);

  const playBeat = useCallback((beat: Beat, newPlaylist?: Beat[]) => {
    setCurrentBeat(beat);
    if (newPlaylist && newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
    }

    setCurrentTime(0);
    setDuration(0);

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(beat.youtubeVideoId);
      setIsPlaying(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current || !currentBeat) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [isPlaying, currentBeat]);

  const seekTo = useCallback((seconds: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setVolumeState(clamped);
    if (playerRef.current) {
      playerRef.current.setVolume(clamped);
      if (clamped === 0) {
        playerRef.current.mute();
        setIsMuted(true);
      } else if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      playerRef.current.setVolume(volume || 50);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const playNext = useCallback(() => {
    if (!currentBeat || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((b) => b.id === currentBeat.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      playBeat(playlist[currentIndex + 1]);
    } else if (playlist.length > 0) {
      playBeat(playlist[0]);
    }
  }, [currentBeat, playlist, playBeat]);

  const playPrevious = useCallback(() => {
    if (!currentBeat || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((b) => b.id === currentBeat.id);
    if (currentIndex > 0) {
      playBeat(playlist[currentIndex - 1]);
    } else if (playlist.length > 0) {
      playBeat(playlist[playlist.length - 1]);
    }
  }, [currentBeat, playlist, playBeat]);

  return (
    <PlayerContext.Provider
      value={{
        currentBeat,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isMuted,
        playlist,
        playBeat,
        togglePlay,
        seekTo,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,
      }}
    >
      {children}
      {/* Headless invisible container for YouTube iframe audio streaming */}
      <div
        id="yt-player-headless"
        className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-1 w-1 opacity-0"
        aria-hidden="true"
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
