import { DBSchema, IDBPDatabase, openDB } from "idb";

const DB_NAME = "studyflow";
const DB_VERSION = 1;
const STORE_KEY = "data";

const STORE_NAMES = [
  "tasks",
  "freeSlots",
  "habits",
  "plan",
  "feedback",
  "library",
  "stats",
  "settings",
  "templates",
  "programs",
] as const;

export type StoreName = (typeof STORE_NAMES)[number];

interface StudyFlowDB extends DBSchema {
  tasks: { key: string; value: unknown };
  freeSlots: { key: string; value: unknown };
  habits: { key: string; value: unknown };
  plan: { key: string; value: unknown };
  feedback: { key: string; value: unknown };
  library: { key: string; value: unknown };
  stats: { key: string; value: unknown };
  settings: { key: string; value: unknown };
  templates: { key: string; value: unknown };
  programs: { key: string; value: unknown };
}

let dbPromise: Promise<IDBPDatabase<StudyFlowDB> | null> | null = null;

const isBrowser = typeof window !== "undefined";

async function getDB(): Promise<IDBPDatabase<StudyFlowDB> | null> {
  if (!isBrowser || !("indexedDB" in window)) {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<StudyFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        STORE_NAMES.forEach((name) => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name);
          }
        });
      },
    }).catch(() => null);
  }
  return dbPromise;
}

async function readLocalFallback<T>(store: StoreName): Promise<T[]> {
  if (!isBrowser) return [];
  const raw = window.localStorage.getItem(`studyflow:${store}`);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

async function writeLocalFallback<T>(store: StoreName, value: T[]): Promise<void> {
  if (!isBrowser) return;
  window.localStorage.setItem(`studyflow:${store}`, JSON.stringify(value));
}

export async function readStore<T>(store: StoreName): Promise<T[]> {
  const db = await getDB();
  if (!db) {
    return readLocalFallback<T>(store);
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const objectStore = tx.objectStore(store);
    const request = objectStore.get(STORE_KEY);
    request.onsuccess = () => {
      resolve((request.result as T[]) ?? []);
    };
    request.onerror = () => {
      reject(request.error);
    };
  }).catch(() => readLocalFallback<T>(store));
}

export async function writeStore<T>(store: StoreName, value: T[]): Promise<void> {
  const db = await getDB();
  if (!db) {
    await writeLocalFallback(store, value);
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const objectStore = tx.objectStore(store);
    const request = objectStore.put(value, STORE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  }).catch(async () => {
    await writeLocalFallback(store, value);
  });
}

export async function clearStore(store: StoreName): Promise<void> {
  const db = await getDB();
  if (!db) {
    if (isBrowser) {
      window.localStorage.removeItem(`studyflow:${store}`);
    }
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(STORE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
