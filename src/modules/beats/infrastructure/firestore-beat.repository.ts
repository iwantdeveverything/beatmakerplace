import { Beat } from '../domain/beat.entity';
import { BeatRepository } from '../domain/beat.repository';
import { db } from '../../../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

const COLLECTION_NAME = 'beats';

export class FirestoreBeatRepository implements BeatRepository {
  async getAll(): Promise<Beat[]> {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    try {
      const beatsRef = collection(db, COLLECTION_NAME);
      const q = query(beatsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((d) => d.data() as Beat);
    } catch (error) {
      console.error('Error fetching beats from Firestore:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Beat | null> {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return null;
    }

    return snap.data() as Beat;
  }

  async save(beat: Beat): Promise<void> {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const docRef = doc(db, COLLECTION_NAME, beat.id);
    await setDoc(docRef, beat, { merge: true });
  }

  async delete(id: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}
