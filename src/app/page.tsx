'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Beat } from '../modules/beats/domain/beat.entity';
import { getBeatRepository } from '../modules/beats/infrastructure/beat-repository.factory';
import { INITIAL_BEATS } from '../modules/beats/infrastructure/mock-beats.data';
import { HeroSection } from '../components/HeroSection';
import { BeatCard } from '../components/BeatCard';
import { Sparkles, Music2, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [beats, setBeats] = useState<Beat[]>(INITIAL_BEATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [whatsAppPhone, setWhatsAppPhone] = useState('521234567890');

  useEffect(() => {
    const repository = getBeatRepository();
    repository.getAll().then((data) => {
      if (data && data.length > 0) {
        setBeats(data);
      }
    });

    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('beatmakerplace_whatsapp');
      if (savedPhone) setWhatsAppPhone(savedPhone);
    }
  }, []);

  const availableGenres = useMemo(() => {
    const genres = Array.from(new Set(beats.map((b) => b.genre)));
    return ['Todos', ...genres];
  }, [beats]);

  const filteredBeats = useMemo(() => {
    return beats.filter((beat) => {
      const matchesGenre =
        selectedGenre === 'Todos' || beat.genre.toLowerCase() === selectedGenre.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        beat.title.toLowerCase().includes(q) ||
        beat.producer.toLowerCase().includes(q) ||
        beat.musicalKey.toLowerCase().includes(q) ||
        beat.bpm.toString().includes(q) ||
        beat.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesGenre && matchesSearch;
    });
  }, [beats, selectedGenre, searchQuery]);

  return (
    <main className="min-h-screen pb-32">
      {/* Hero Header & Search */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        availableGenres={availableGenres}
      />

      {/* Catalog Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Catálogo de Beats
            </h2>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono font-medium text-zinc-400">
              {filteredBeats.length} {filteredBeats.length === 1 ? 'beat' : 'beats'}
            </span>
          </div>

          {(searchQuery || selectedGenre !== 'Todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Todos');
              }}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Beats Grid */}
        {filteredBeats.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBeats.map((beat) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                playlist={filteredBeats}
                whatsAppPhone={whatsAppPhone}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-200">
              No se encontraron beats
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Probá con otro término de búsqueda o seleccioná otro género musical.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Todos');
              }}
              className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
