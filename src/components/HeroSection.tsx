'use client';

import React from 'react';
import { Search, SlidersHorizontal, Flame } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  availableGenres: string[];
}

export function HeroSection({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  availableGenres,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 py-12 sm:py-16">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[600px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-400">
          <Flame className="h-3.5 w-3.5" />
          <span>Venta directa de beats sin intermediarios</span>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Encontrá el sonido perfecto para tu próximo track
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-zinc-400">
          Escuchá previews en tiempo real, elegí tu instrumental y cerrá tu licencia (WAV master + stems) directamente por WhatsApp.
        </p>

        {/* Search & Filters Bar */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por título, tag o subgénero (ej: Trap, 140, Dark)..."
              aria-label="Buscar beats"
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 py-3.5 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-500 shadow-lg outline-none backdrop-blur transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Genre Filter Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Géneros:</span>
            </div>
            {availableGenres.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => onGenreChange(genre)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                      : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
