/**
 * ==========================================================================
 * IndexedDB helper functions for storing and retrieving WAV Blobs.
 *   • withStore   – low-level helper for object store transactions.
 *   • putWav      – stores up to 10 recordings, deletes oldest beyond cap.
 *   • loadWav     – retrieves a stored recording by ID.
 * ==========================================================================
 */

const DB = "wavRecordings", STORE = "files";

function withStore<T>(
  mode: "readonly" | "readwrite",
  f: (st: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((res, rej) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () =>
      open.result.createObjectStore(STORE, { keyPath: "id" });
    open.onerror = (e) => rej(e);
    open.onsuccess = () => {
      const tx = open.result.transaction(STORE, mode);
      const st = tx.objectStore(STORE);
      const req = f(st);
      req.onsuccess = () => res(req.result);
      req.onerror = (e) => rej(e);
    };
  });
}

/** ==========================================================================
 * Stores a WAV Blob under the given `id`, keeps only the 10 newest entries.
 * @param id    Unique identifier for this recording.
 * @param blob  WAV Blob to store.
 * ===========================================================================*/

export async function putWav(id: string, blob: Blob) {
  await withStore("readwrite", (st) =>
    st.put({ id, ts: Date.now(), blob })
  );
  const all: { id: string; ts: number }[] = await withStore("readonly", (st) =>
    st.getAll()
  );
  all.sort((a, b) => b.ts - a.ts);
  for (const o of all.slice(10)) {
    await withStore("readwrite", (st) => st.delete(o.id));
  }
}

/** ===========================================================================
 * Retrieves a stored WAV Blob by `id`, or null if not found.
 * @param id  Unique identifier for the recording.
 * @returns   The stored Blob, or null.
 * ===========================================================================*/
export async function loadWav(id: string): Promise<Blob | null> {
  const rec = await withStore("readonly", (st) => st.get(id));
  return rec?.blob ?? null;
}
