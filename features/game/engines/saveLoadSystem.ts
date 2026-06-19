import type { GameState, SavePayload } from "@/features/game/types";

export const SAVE_KEY = "pizza-restaurant-save";
export const SAVE_VERSION = 1;

/** Abstract persistence — swap LocalStorage for PostgreSQL later. */
export interface SaveRepository {
  load(): Promise<SavePayload | null>;
  save(payload: SavePayload): Promise<void>;
  clear(): Promise<void>;
}

export class LocalSaveRepository implements SaveRepository {
  constructor(private readonly key = SAVE_KEY) {}

  async load(): Promise<SavePayload | null> {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as SavePayload;
      if (!parsed.state || parsed.state.version !== SAVE_VERSION) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  async save(payload: SavePayload): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.key, JSON.stringify(payload));
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.key);
  }
}

/** IndexedDB fallback for larger saves — mirrors SaveRepository interface. */
export class IndexedDbSaveRepository implements SaveRepository {
  private dbName = "pizza-restaurant";
  private storeName = "saves";

  private async openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async load(): Promise<SavePayload | null> {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return null;
    }

    try {
      const db = await this.openDb();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const request = store.get(SAVE_KEY);
        request.onsuccess = () => resolve((request.result as SavePayload) ?? null);
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async save(payload: SavePayload): Promise<void> {
    if (typeof window === "undefined" || !("indexedDB" in window)) return;

    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.put(payload, SAVE_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined" || !("indexedDB" in window)) return;

    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const request = store.delete(SAVE_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export function createSavePayload(state: GameState): SavePayload {
  return {
    state: { ...state, lastSavedAt: Date.now() },
    savedAt: Date.now(),
  };
}

export async function persistGame(
  repository: SaveRepository,
  state: GameState,
): Promise<void> {
  await repository.save(createSavePayload(state));
}

export async function loadGame(
  repository: SaveRepository,
): Promise<GameState | null> {
  const payload = await repository.load();
  return payload?.state ?? null;
}

export async function clearSave(repository: SaveRepository): Promise<void> {
  await repository.clear();
}
