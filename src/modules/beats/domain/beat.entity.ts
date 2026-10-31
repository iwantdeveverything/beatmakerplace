export interface BeatLicense {
  id: 'standard' | 'premium' | 'unlimited';
  name: string;
  price: number;
  features: string[];
}

export interface Beat {
  id: string;
  title: string;
  producer: string;
  bpm: number;
  musicalKey: string;
  genre: string;
  tags: string[];
  youtubeUrl: string;
  youtubeVideoId: string;
  coverUrl?: string;
  priceStandard: number;
  priceExclusive?: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * (e.g., youtu.be/xyz, youtube.com/watch?v=xyz, youtube.com/embed/xyz)
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );

  return match ? match[1] : null;
}

/**
 * Returns the highest resolution thumbnail available for a YouTube video
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Generates direct WhatsApp click-to-chat URL with pre-filled message
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  beat: Beat,
  licenseType: string = 'Standard'
): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const message = `¡Hola! Me interesa adquirir la licencia ${licenseType} para el beat "${beat.title}" (${beat.bpm} BPM, ${beat.musicalKey}) que escuché en BeatMakerPlace. Link: https://youtu.be/${beat.youtubeVideoId}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
