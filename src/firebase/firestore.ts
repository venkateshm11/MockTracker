import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { MockDocument, MockWithId } from '../types/mock';

function getLocalKey(uid: string) {
  return `mocktrack_mocks_${uid}`;
}

const localSubscribers = new Map<string, Set<(mocks: MockWithId[]) => void>>();

function toTimestamp(val: unknown): Timestamp {
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return val as Timestamp;
  }
  if (val && typeof val === 'object' && 'seconds' in val) {
    const s = (val as { seconds: number; nanoseconds?: number }).seconds;
    const ns = (val as { seconds: number; nanoseconds?: number }).nanoseconds ?? 0;
    return new Timestamp(s, ns);
  }
  if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return Timestamp.fromDate(d);
    }
  }
  return Timestamp.now();
}

function parseLocalMocks(uid: string): MockWithId[] {
  try {
    const raw = localStorage.getItem(getLocalKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((m: any) => ({
      ...m,
      date: toTimestamp(m.date),
      createdAt: toTimestamp(m.createdAt),
      updatedAt: toTimestamp(m.updatedAt),
    }));
  } catch (err) {
    console.warn('Failed to parse local mocks:', err);
    return [];
  }
}

function saveLocalMocks(uid: string, mocks: MockWithId[]) {
  try {
    localStorage.setItem(getLocalKey(uid), JSON.stringify(mocks));
  } catch (err) {
    console.error('Failed to save local mocks:', err);
  }
  notifyLocalSubscribers(uid, mocks);
}

function notifyLocalSubscribers(uid: string, mocks: MockWithId[]) {
  const set = localSubscribers.get(uid);
  if (set) {
    const sorted = [...mocks].sort((a, b) => a.mockNumber - b.mockNumber);
    set.forEach((cb) => cb(sorted));
  }
}

function mocksRef(uid: string) {
  if (!db) throw new Error('Firestore not initialized');
  return collection(db, 'users', uid, 'mocks');
}

export async function addMock(
  uid: string,
  data: Omit<MockDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Timestamp.now();

  if (!db || !isFirebaseConfigured || uid === 'guest_user') {
    const localMocks = parseLocalMocks(uid);
    const newId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newMock: MockWithId = {
      ...data,
      id: newId,
      date: toTimestamp(data.date),
      createdAt: now,
      updatedAt: now,
    };
    localMocks.push(newMock);
    saveLocalMocks(uid, localMocks);
    return newId;
  }

  const docRef = await addDoc(mocksRef(uid), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateMock(uid: string, mockId: string, data: Partial<MockDocument>): Promise<void> {
  const now = Timestamp.now();

  if (!db || !isFirebaseConfigured || uid === 'guest_user') {
    const localMocks = parseLocalMocks(uid);
    const idx = localMocks.findIndex((m) => m.id === mockId);
    if (idx !== -1) {
      localMocks[idx] = {
        ...localMocks[idx],
        ...data,
        updatedAt: now,
      };
      saveLocalMocks(uid, localMocks);
    }
    return;
  }

  const ref = doc(db, 'users', uid, 'mocks', mockId);
  await updateDoc(ref, { ...data, updatedAt: now });
}

export async function getMock(uid: string, mockId: string): Promise<MockWithId | null> {
  if (!db || !isFirebaseConfigured || uid === 'guest_user') {
    const localMocks = parseLocalMocks(uid);
    return localMocks.find((m) => m.id === mockId) ?? null;
  }

  const ref = doc(db, 'users', uid, 'mocks', mockId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MockWithId;
}

export async function getMocks(uid: string, constraints?: QueryConstraint[]): Promise<MockWithId[]> {
  if (!db || !isFirebaseConfigured || uid === 'guest_user') {
    const localMocks = parseLocalMocks(uid);
    return [...localMocks].sort((a, b) => b.mockNumber - a.mockNumber);
  }

  const q = constraints
    ? query(mocksRef(uid), ...constraints)
    : query(mocksRef(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockWithId));
}

export async function getAllMocks(uid: string): Promise<MockWithId[]> {
  if (!db || !isFirebaseConfigured || uid === 'guest_user') {
    const localMocks = parseLocalMocks(uid);
    return [...localMocks].sort((a, b) => a.mockNumber - b.mockNumber);
  }

  const q = query(mocksRef(uid), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockWithId));
}

export async function getMocksByExamSeries(
  uid: string,
  exam: string,
  testSeries: string
): Promise<MockWithId[]> {
  if (!db || !isFirebaseConfigured || uid === 'guest_user') {
    const localMocks = parseLocalMocks(uid);
    return localMocks
      .filter((m) => m.exam === exam && m.testSeries === testSeries)
      .sort((a, b) => a.mockNumber - b.mockNumber);
  }

  const q = query(
    mocksRef(uid),
    where('exam', '==', exam),
    where('testSeries', '==', testSeries),
    orderBy('mockNumber', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockWithId));
}

export function subscribeMocks(uid: string, callback: (mocks: MockWithId[]) => void) {
  if (!db || !isFirebaseConfigured || uid === 'guest_user') {
    let set = localSubscribers.get(uid);
    if (!set) {
      set = new Set();
      localSubscribers.set(uid, set);
    }
    set.add(callback);

    // Initial local read
    const mocks = parseLocalMocks(uid);
    callback([...mocks].sort((a, b) => a.mockNumber - b.mockNumber));

    return () => {
      const currentSet = localSubscribers.get(uid);
      if (currentSet) {
        currentSet.delete(callback);
        if (currentSet.size === 0) localSubscribers.delete(uid);
      }
    };
  }

  const q = query(mocksRef(uid), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const mocks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockWithId));
    callback(mocks);
  });
}

export async function batchImportMocks(uid: string, mocks: Omit<MockDocument, 'id'>[]): Promise<number> {
  const now = Timestamp.now();

  if (!db || !isFirebaseConfigured || uid === 'guest_user') {
    const localMocks = parseLocalMocks(uid);
    let count = 0;
    for (const m of mocks) {
      const newMock: MockWithId = {
        ...m,
        id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        date: toTimestamp(m.date),
        createdAt: now,
        updatedAt: now,
      };
      localMocks.push(newMock);
      count++;
    }
    saveLocalMocks(uid, localMocks);
    return count;
  }

  const batch = writeBatch(db);
  const ref = mocksRef(uid);
  let count = 0;
  for (const mock of mocks) {
    const newRef = doc(ref);
    batch.set(newRef, { ...mock, createdAt: now, updatedAt: now });
    count++;
  }
  await batch.commit();
  return count;
}
