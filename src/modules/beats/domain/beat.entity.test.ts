import { describe, it, expect } from 'vitest';
import {
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  generateWhatsAppLink,
  Beat,
} from './beat.entity';

describe('Beat Domain Entity & Helpers', () => {
  describe('extractYouTubeVideoId', () => {
    it('extracts ID from standard watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
      expect(extractYouTubeVideoId(url)).toBe('jfKfPfyJRdk');
    });

    it('extracts ID from shortened youtu.be URL', () => {
      const url = 'https://youtu.be/jfKfPfyJRdk';
      expect(extractYouTubeVideoId(url)).toBe('jfKfPfyJRdk');
    });

    it('extracts ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/jfKfPfyJRdk';
      expect(extractYouTubeVideoId(url)).toBe('jfKfPfyJRdk');
    });

    it('returns the ID directly if an 11-char ID is passed', () => {
      expect(extractYouTubeVideoId('jfKfPfyJRdk')).toBe('jfKfPfyJRdk');
    });

    it('returns null for empty or invalid URL', () => {
      expect(extractYouTubeVideoId('')).toBeNull();
      expect(extractYouTubeVideoId('https://example.com/audio.mp3')).toBeNull();
    });
  });

  describe('getYouTubeThumbnail', () => {
    it('generates hqdefault thumbnail URL from video ID', () => {
      expect(getYouTubeThumbnail('jfKfPfyJRdk')).toBe(
        'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg'
      );
    });
  });

  describe('generateWhatsAppLink', () => {
    const mockBeat: Beat = {
      id: 'beat-1',
      title: 'Midnight Tokyo',
      producer: 'BeatMaker',
      bpm: 140,
      musicalKey: 'C Minor',
      genre: 'Trap',
      tags: ['Dark', '808'],
      youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      youtubeVideoId: 'jfKfPfyJRdk',
      priceStandard: 29.99,
      isAvailable: true,
      createdAt: '2026-10-30T00:00:00Z',
    };

    it('generates correct wa.me link with prefilled inquiry message', () => {
      const link = generateWhatsAppLink('521234567890', mockBeat, 'Standard');
      expect(link).toContain('https://wa.me/521234567890?text=');
      expect(link).toContain(encodeURIComponent('Midnight Tokyo'));
      expect(link).toContain(encodeURIComponent('140 BPM'));
      expect(link).toContain(encodeURIComponent('C Minor'));
      expect(link).toContain(encodeURIComponent('https://youtu.be/jfKfPfyJRdk'));
    });
  });
});
