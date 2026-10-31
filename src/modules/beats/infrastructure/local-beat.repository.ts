import { Beat } from '../domain/beat.entity';
import { BeatRepository } from '../domain/beat.repository';
import { INITIAL_BEATS } from './mock-beats.data';

const STORAGE_KEY = 'beatmakerplace_beats_v1';

export class LocalBeatRepository implements BeatRepository {
  private getStorage(): Beat[] {
    if (typeof window === 'undefined') {
      return INITIAL_BEATS;
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BEATS));
        return INITIAL_BEATS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading from localStorage, using initial mock data:', e);
      return INITIAL_BEATS;
    }
  }

  private setStorage(beats: Beat[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(beats));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  }

  async getAll(): Promise<Beat[]> {
    return this.getStorage();
  }

  async getById(id: string): Promise<Beat | null> {
    const beats = this.getStorage();
    return beats.find((b) => b.id === id) || null;
  }

  async save(beat: Beat): Promise<void> {
    const beats = this.getStorage();
    const existingIndex = beats.findIndex((b) => b.id === beat.id);
    let updated: Beat[];

    if (existingIndex >= 0) {
      updated = [...beats];
      updated[existingIndex] = beat;
    } else {
      updated = [beat, ...beats];
    }

    this.setStorage(updated);
  }

  async delete(id: string): Promise<void> {
    const beats = this.getStorage();
    const updated = beats.filter((b) => b.id !== id);
    this.setStorage(updated);
  }
}
