'use client';

import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { generateWhatsAppLink } from '../../beats/domain/beat.entity';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  MessageCircle,
  Music,
} from 'lucide-react';

interface GlobalBottomPlayerProps {
  whatsAppPhone?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function GlobalBottomPlayer({
  whatsAppPhone: defaultPhone = '521234567890',
}: GlobalBottomPlayerProps) {
  const [phone, setPhone] = React.useState(defaultPhone);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('beatmakerplace_whatsapp');
      if (saved) setPhone(saved);
    }
  }, []);

  const {
    currentBeat,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
  } = usePlayer();

  if (!currentBeat) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const whatsAppLink = generateWhatsAppLink(phone, currentBeat, 'Standard');

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value);
    const targetSeconds = (newPercent / 100) * duration;
    seekTo(targetSeconds);
  };

  return (
    <aside
      aria-label="Reproductor de audio global"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 py-3 text-zinc-100 shadow-2xl transition-all"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 md:w-1/4">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 shadow">
            {currentBeat.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentBeat.coverUrl}
                alt={currentBeat.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-500">
                <Music className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-white">
              {currentBeat.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>{currentBeat.producer}</span>
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-amber-400">{currentBeat.bpm} BPM</span>
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-zinc-300">{currentBeat.musicalKey}</span>
            </div>
          </div>
        </div>

        {/* Player Controls & Scrubber */}
        <div className="flex flex-1 flex-col items-center gap-1.5 md:max-w-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={playPrevious}
              aria-label="Pista anterior"
              className="text-zinc-400 transition hover:text-white"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar beat' : 'Reproducir beat'}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-zinc-950 transition hover:scale-105 hover:bg-amber-400 active:scale-95"
            >
              {isBuffering ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>

            <button
              onClick={playNext}
              aria-label="Siguiente pista"
              className="text-zinc-400 transition hover:text-white"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Scrubber */}
          <div className="flex w-full items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progressPercent || 0}
                onChange={handleSeek}
                aria-label="Barra de progreso de audio"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-amber-500 hover:h-2 transition-all"
              />
            </div>
            <span className="w-10 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & WhatsApp CTA */}
        <div className="flex items-center justify-end gap-3 md:w-1/4">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Desactivar silencio' : 'Silenciar'}
              className="text-zinc-400 transition hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Control de volumen"
              className="h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-amber-500"
            />
          </div>

          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comprar (${currentBeat.priceStandard})</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
