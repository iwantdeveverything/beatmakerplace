'use client';

import React from 'react';
import { Beat, generateWhatsAppLink } from '../modules/beats/domain/beat.entity';
import { usePlayer } from '../modules/player/context/PlayerContext';
import { Play, Pause, MessageCircle, Music, Sparkles } from 'lucide-react';

interface BeatCardProps {
  beat: Beat;
  playlist: Beat[];
  whatsAppPhone?: string;
}

export function BeatCard({
  beat,
  playlist,
  whatsAppPhone = '521234567890',
}: BeatCardProps) {
  const { currentBeat, isPlaying, playBeat, togglePlay } = usePlayer();

  const isThisBeatActive = currentBeat?.id === beat.id;
  const isThisBeatPlaying = isThisBeatActive && isPlaying;

  const handlePlayToggle = () => {
    if (isThisBeatActive) {
      togglePlay();
    } else {
      playBeat(beat, playlist);
    }
  };

  const whatsAppLink = generateWhatsAppLink(whatsAppPhone, beat, 'Standard');

  return (
    <article
      aria-label={`Beat ${beat.title}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-zinc-900/60 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/90 ${
        isThisBeatActive
          ? 'border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/5'
          : 'border-zinc-800/80 shadow-md'
      }`}
    >
      <div>
        {/* Cover Artwork & Play Overlay */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800">
          {beat.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={beat.coverUrl}
              alt={beat.title}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isThisBeatPlaying ? 'scale-105' : ''
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-600">
              <Music className="h-10 w-10" />
            </div>
          )}

          {/* Featured Badge */}
          {beat.isFeatured && (
            <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-950 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              <span>Featured</span>
            </div>
          )}

          {/* Genre Badge */}
          <div className="absolute right-2.5 top-2.5 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm border border-zinc-700/50">
            {beat.genre}
          </div>

          {/* Play/Pause Button Overlay */}
          <button
            onClick={handlePlayToggle}
            aria-label={
              isThisBeatPlaying
                ? `Pausar ${beat.title}`
                : `Reproducir ${beat.title}`
            }
            className={`absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] transition-opacity duration-200 ${
              isThisBeatActive
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
            }`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 active:scale-95 ${
                isThisBeatPlaying
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-100 text-zinc-950'
              }`}
            >
              {isThisBeatPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              )}
            </div>
          </button>
        </div>

        {/* Beat Details */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
              {beat.title}
            </h3>
            <span className="font-mono text-sm font-bold text-amber-400 flex-shrink-0">
              ${beat.priceStandard}
            </span>
          </div>

          {/* Metadata badges: BPM & Key */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-zinc-300 border border-zinc-700/60">
              {beat.bpm} BPM
            </span>
            <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-zinc-300 border border-zinc-700/60">
              {beat.musicalKey}
            </span>
          </div>

          {/* Tags */}
          {beat.tags && beat.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {beat.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-zinc-500 hover:text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA: WhatsApp Buy Button */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <button
          onClick={handlePlayToggle}
          className="text-xs font-medium text-zinc-400 hover:text-white transition flex items-center gap-1"
        >
          {isThisBeatPlaying ? (
            <span className="text-amber-400 flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              Sonando
            </span>
          ) : (
            'Escuchar'
          )}
        </button>

        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Comprar</span>
        </a>
      </div>
    </article>
  );
}
