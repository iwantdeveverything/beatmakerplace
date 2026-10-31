import { describe, it, expect } from 'vitest';
import {
  extractBpmFromTitle,
  extractKeyFromTitle,
} from './youtube-importer.service';

describe('YouTube Importer Service', () => {
  describe('extractBpmFromTitle', () => {
    it('detects BPM when formatted as 140 BPM', () => {
      expect(extractBpmFromTitle('Drake Type Beat - "Sunset" | 140 BPM')).toBe(140);
    });

    it('detects BPM when formatted as 88bpm', () => {
      expect(extractBpmFromTitle('Boom Bap Beat (88bpm) - Vinyl Sample')).toBe(88);
    });

    it('returns undefined when no BPM pattern exists', () => {
      expect(extractBpmFromTitle('Chill Vibes Instrumental')).toBeUndefined();
    });
  });

  describe('extractKeyFromTitle', () => {
    it('detects minor keys like C Minor or Dmin', () => {
      expect(extractKeyFromTitle('Dark Trap Beat | 140 BPM | C Minor')).toBe('C Minor');
      expect(extractKeyFromTitle('Gunna Style Instrumental (F#min)')).toBe('F# Minor');
    });

    it('detects major keys like G Major', () => {
      expect(extractKeyFromTitle('Uplifting Hip Hop | G Major')).toBe('G Major');
    });

    it('returns undefined if no musical key is found', () => {
      expect(extractKeyFromTitle('Free Type Beat 2026')).toBeUndefined();
    });
  });
});
