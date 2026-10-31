import { extractYouTubeVideoId, getYouTubeThumbnail } from '../domain/beat.entity';

export interface YouTubeMetadata {
  videoId: string;
  url: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  suggestedBpm?: number;
  suggestedKey?: string;
}

/**
 * Attempts to parse BPM (e.g. "140 BPM", "140bpm", "140 bpm") from a text title
 */
export function extractBpmFromTitle(title: string): number | undefined {
  const match = title.match(/\b([5-9][0-9]|1[0-9]{2}|2[0-1][0-9])\s*(?:bpm|BPM)\b/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Attempts to parse musical key (e.g. "C Minor", "Dmin", "F# Minor", "G#m") from a title
 */
export function extractKeyFromTitle(title: string): string | undefined {
  const match = title.match(
    /\b([A-G][#b]?)\s*(?:minor|major|min|maj|m)\b/i
  );
  if (!match) return undefined;

  const note = match[1].toUpperCase();
  const lower = match[0].toLowerCase();
  const isMinor = lower.includes('min') || lower.endsWith('m') || lower.includes('minor');

  return `${note} ${isMinor ? 'Minor' : 'Major'}`;
}

/**
 * Fetches YouTube video details using oEmbed without API key requirements
 */
export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata | null> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  const cleanUrl = `https://www.youtube.com/watch?v=`;
  const defaultThumbnail = getYouTubeThumbnail(videoId);

  try {
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}`;
    const res = await fetch(oembedUrl);

    if (res.ok) {
      const data = await res.json();
      const title = data.title || 'Untitled Beat';
      const author = data.author_name || 'Producer';

      return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        author,
        thumbnailUrl: data.thumbnail_url || defaultThumbnail,
        suggestedBpm: extractBpmFromTitle(title),
        suggestedKey: extractKeyFromTitle(title),
      };
    }
  } catch (error) {
    console.warn('Failed to fetch oEmbed info for YouTube:', error);
  }

  // Fallback with just extracted ID
  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: 'Nuevo Beat',
    author: 'BeatMaker',
    thumbnailUrl: defaultThumbnail,
  };
}
