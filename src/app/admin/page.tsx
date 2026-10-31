'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Beat, extractYouTubeVideoId, getYouTubeThumbnail } from '../../modules/beats/domain/beat.entity';
import { getBeatRepository } from '../../modules/beats/infrastructure/beat-repository.factory';
import { fetchYouTubeMetadata } from '../../modules/beats/infrastructure/youtube-importer.service';
import { isFirebaseConfigured } from '../../lib/firebase';
import { usePlayer } from '../../modules/player/context/PlayerContext';
import { YouTubeIcon } from '../../components/icons/YouTubeIcon';
import {
  ArrowLeft,
  PlusCircle,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  Cloud,
  HardDrive,
  Sparkles,
  Phone,
  Music,
} from 'lucide-react';

const COMMON_KEYS = [
  'C Minor', 'C Major',
  'C# Minor', 'C# Major',
  'D Minor', 'D Major',
  'D# Minor', 'D# Major',
  'E Minor', 'E Major',
  'F Minor', 'F Major',
  'F# Minor', 'F# Major',
  'G Minor', 'G Major',
  'G# Minor', 'G# Major',
  'A Minor', 'A Major',
  'A# Minor', 'A# Major',
  'B Minor', 'B Major',
];

const GENRES = ['Trap', 'Boom Bap', 'Drill', 'R&B', 'Synthwave', 'Reggaeton', 'Afrobeat'];

export default function AdminPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importingUrl, setImportingUrl] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [producer, setProducer] = useState('BeatMaker');
  const [bpm, setBpm] = useState<number>(140);
  const [musicalKey, setMusicalKey] = useState('C Minor');
  const [genre, setGenre] = useState('Trap');
  const [tagsInput, setTagsInput] = useState('');
  const [priceStandard, setPriceStandard] = useState<number>(29.99);
  const [priceExclusive, setPriceExclusive] = useState<number>(199.99);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>('');

  // WhatsApp Configuration State
  const [whatsAppPhone, setWhatsAppPhone] = useState<string>('521234567890');

  const { currentBeat, isPlaying, playBeat, togglePlay } = usePlayer();
  const repository = getBeatRepository();

  useEffect(() => {
    loadBeats();
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('beatmakerplace_whatsapp');
      if (savedPhone) setWhatsAppPhone(savedPhone);
    }
  }, []);

  const loadBeats = async () => {
    try {
      setLoading(true);
      const data = await repository.getAll();
      setBeats(data);
    } catch (e) {
      console.error('Error loading beats:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('beatmakerplace_whatsapp', whatsAppPhone);
      setFeedbackMessage('Número de WhatsApp actualizado correctamente');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleImportYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importingUrl.trim()) return;

    setIsImporting(true);
    try {
      const meta = await fetchYouTubeMetadata(importingUrl.trim());
      if (meta) {
        setYoutubeVideoId(meta.videoId);
        setYoutubeUrl(meta.url);
        setTitle(meta.title);
        setCoverUrl(meta.thumbnailUrl);
        if (meta.suggestedBpm) setBpm(meta.suggestedBpm);
        if (meta.suggestedKey) setMusicalKey(meta.suggestedKey);
        setFeedbackMessage('Metadata de YouTube importada con éxito');
        setTimeout(() => setFeedbackMessage(null), 3000);
      } else {
        alert('No se pudo reconocer una URL válida de YouTube.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al consultar el video de YouTube.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleManualVideoIdChange = (id: string) => {
    const cleanId = extractYouTubeVideoId(id) || id.trim();
    setYoutubeVideoId(cleanId);
    setYoutubeUrl(`https://www.youtube.com/watch?v=${cleanId}`);
    setCoverUrl(getYouTubeThumbnail(cleanId));
  };

  const handleSaveBeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeVideoId.trim()) {
      alert('Por favor ingresá un título y el video de YouTube.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newBeat: Beat = {
      id: `beat-${Date.now()}`,
      title: title.trim(),
      producer: producer.trim() || 'BeatMaker',
      bpm: Number(bpm) || 120,
      musicalKey,
      genre,
      tags: tags.length > 0 ? tags : ['Instrumental'],
      youtubeUrl: youtubeUrl || `https://www.youtube.com/watch?v=${youtubeVideoId}`,
      youtubeVideoId,
      coverUrl: coverUrl || getYouTubeThumbnail(youtubeVideoId),
      priceStandard: Number(priceStandard) || 29.99,
      priceExclusive: Number(priceExclusive) || 199.99,
      isAvailable: true,
      isFeatured,
      createdAt: new Date().toISOString(),
    };

    try {
      await repository.save(newBeat);
      await loadBeats();
      // Reset form
      setTitle('');
      setImportingUrl('');
      setYoutubeVideoId('');
      setCoverUrl('');
      setTagsInput('');
      setIsFeatured(false);
      setFeedbackMessage('¡Beat publicado exitosamente en tu catálogo!');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Error saving beat:', err);
      alert('Hubo un error al guardar el beat.');
    }
  };

  const handleDeleteBeat = async (id: string, beatTitle: string) => {
    if (confirm(`¿Estás seguro de que querés eliminar "${beatTitle}"?`)) {
      try {
        await repository.delete(id);
        await loadBeats();
        setFeedbackMessage('Beat eliminado.');
        setTimeout(() => setFeedbackMessage(null), 3000);
      } catch (err) {
        console.error(err);
        alert('Error al eliminar el beat.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-36">
      {/* Top Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la Tienda</span>
          </Link>

          <div className="flex items-center gap-3">
            {isFirebaseConfigured ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/30">
                <Cloud className="h-3.5 w-3.5" />
                <span>Google Cloud Firestore</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/30" title="Para sincronizar con la nube de Google, agregá las variables de Firebase en .env.local">
                <HardDrive className="h-3.5 w-3.5" />
                <span>Modo Local (Listo para conectar a GCP)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Panel de Control del Beatmaker (CMS)
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Cargá nuevos beats desde YouTube, personalizá BPM, escala y gestioná tu catálogo sin costos de almacenamiento.
          </p>
        </div>

        {feedbackMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-950/80 border border-emerald-800 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: YouTube Importer & Beat Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* YouTube Quick Importer Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-md">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <YouTubeIcon className="h-5 w-5 text-red-500" />
                <h2 className="text-base font-semibold text-white">
                  Importar Beat desde YouTube
                </h2>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Pegá el link de tu beat publicado en YouTube para extraer automáticamente el título, thumbnail y audio.
              </p>

              <form onSubmit={handleImportYouTube} className="mt-4 flex gap-2">
                <input
                  type="url"
                  value={importingUrl}
                  onChange={(e) => setImportingUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isImporting || !importingUrl.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                >
                  {isImporting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <YouTubeIcon className="h-4 w-4" />
                      <span>Cargar Video</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Beat Form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-md">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <PlusCircle className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-white">
                  Detalles del Beat
                </h2>
              </div>

              <form onSubmit={handleSaveBeat} className="mt-5 space-y-4">
                {/* Preview if YouTube ID exists */}
                {youtubeVideoId && (
                  <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                    <img
                      src={coverUrl || getYouTubeThumbnail(youtubeVideoId)}
                      alt="Preview"
                      className="h-16 w-24 object-cover rounded border border-zinc-800"
                    />
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-white block">Video Vinculado:</span>
                      <span className="font-mono text-amber-400 block">{youtubeVideoId}</span>
                      <span className="text-zinc-500">Thumbnail y audio sincronizados con YouTube</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    Título del Beat *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Tokyo Drift (Hard Trap Beat)"
                    className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">
                      ID o URL de YouTube *
                    </label>
                    <input
                      type="text"
                      required
                      value={youtubeVideoId}
                      onChange={(e) => handleManualVideoIdChange(e.target.value)}
                      placeholder="Ej: jfKfPfyJRdk"
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300">
                      Productor
                    </label>
                    <input
                      type="text"
                      value={producer}
                      onChange={(e) => setProducer(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">
                      BPM (Tempo)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="220"
                      value={bpm}
                      onChange={(e) => setBpm(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300">
                      Escala Musical
                    </label>
                    <select
                      value={musicalKey}
                      onChange={(e) => setMusicalKey(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                    >
                      {COMMON_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300">
                      Género
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                    >
                      {GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">
                      Precio Estándar (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceStandard}
                      onChange={(e) => setPriceStandard(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300">
                      Precio Exclusiva (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceExclusive}
                      onChange={(e) => setPriceExclusive(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    Tags (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Dark, 808, Hard, Drake, Metro Boomin"
                    className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-medium text-zinc-300 flex items-center gap-1 cursor-pointer">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Destacar en la portada principal</span>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-amber-500 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-950 transition hover:bg-amber-400 active:scale-95"
                  >
                    Publicar Beat en la Tienda
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Settings & Direct WhatsApp config */}
          <div className="space-y-6">
            {/* WhatsApp Config Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-md">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Phone className="h-5 w-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-white">
                  WhatsApp para Ventas
                </h2>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Tu número con código de país (sin + ni espacios). Los botones &quot;Comprar&quot; de la tienda abrirán un chat con este número.
              </p>

              <form onSubmit={handlePhoneSave} className="mt-4 space-y-3">
                <input
                  type="text"
                  value={whatsAppPhone}
                  onChange={(e) => setWhatsAppPhone(e.target.value)}
                  placeholder="521234567890"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white font-mono outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                  Guardar Teléfono
                </button>
              </form>
            </div>

            {/* Google Cloud Free Tier Instructions */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-xs text-zinc-400 space-y-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Cloud className="h-4 w-4 text-amber-500" />
                <span>Google Cloud / Firebase Free Tier</span>
              </h3>
              <p>
                Tu proyecto está preparado con arquitectura hexagonal para conectarse a **Cloud Firestore**.
              </p>
              <p>
                Para habilitar la persistencia cloud gratuita para siempre, creá un proyecto en Firebase Console y definí en <code className="text-amber-400">.env.local</code>:
              </p>
              <pre className="rounded bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-300 overflow-x-auto border border-zinc-800">
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
              </pre>
            </div>
          </div>
        </div>

        {/* Existing Beats Management List */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-md">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Beats Publicados</h2>
              <p className="text-xs text-zinc-400">
                {beats.length} {beats.length === 1 ? 'beat en catálogo' : 'beats en catálogo'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-zinc-500">Cargando catálogo...</div>
          ) : beats.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              Todavía no cargaste ningún beat. ¡Importá el primero desde YouTube arriba!
            </div>
          ) : (
            <div className="mt-4 divide-y divide-zinc-800/80">
              {beats.map((beat) => {
                const isThisBeatActive = currentBeat?.id === beat.id;
                const isThisPlaying = isThisBeatActive && isPlaying;

                return (
                  <div
                    key={beat.id}
                    className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail with play trigger */}
                      <button
                        onClick={() => {
                          if (isThisBeatActive) togglePlay();
                          else playBeat(beat, beats);
                        }}
                        className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded bg-zinc-950 border border-zinc-800 group"
                        title={isThisPlaying ? 'Pausar' : 'Reproducir'}
                      >
                        {beat.coverUrl ? (
                          <img
                            src={beat.coverUrl}
                            alt={beat.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <Music className="h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-zinc-950/40 transition ${
                            isThisBeatActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isThisPlaying ? (
                            <Pause className="h-4 w-4 text-amber-400 fill-current" />
                          ) : (
                            <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                          )}
                        </div>
                      </button>

                      <div>
                        <h4 className="text-sm font-semibold text-white">{beat.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span className="font-mono text-amber-400">{beat.bpm} BPM</span>
                          <span>•</span>
                          <span className="font-mono">{beat.musicalKey}</span>
                          <span>•</span>
                          <span className="text-zinc-500">{beat.genre}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="font-mono text-sm font-bold text-amber-400">
                        ${beat.priceStandard}
                      </div>

                      <button
                        onClick={() => handleDeleteBeat(beat.id, beat.title)}
                        aria-label={`Eliminar ${beat.title}`}
                        className="rounded p-1.5 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
