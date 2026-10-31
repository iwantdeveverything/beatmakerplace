import { Beat } from './beat.entity';

export interface BeatRepository {
  getAll(): Promise<Beat[]>;
  getById(id: string): Promise<Beat | null>;
  save(beat: Beat): Promise<void>;
  delete(id: string): Promise<void>;
}
