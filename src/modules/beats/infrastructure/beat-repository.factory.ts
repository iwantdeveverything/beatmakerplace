import { BeatRepository } from '../domain/beat.repository';
import { isFirebaseConfigured } from '../../../lib/firebase';
import { FirestoreBeatRepository } from './firestore-beat.repository';
import { LocalBeatRepository } from './local-beat.repository';

let instance: BeatRepository | null = null;

export function getBeatRepository(): BeatRepository {
  if (instance) return instance;

  if (isFirebaseConfigured) {
    instance = new FirestoreBeatRepository();
  } else {
    instance = new LocalBeatRepository();
  }

  return instance;
}
