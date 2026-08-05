import { ApiError, deleteFavorite, getServerFavorites, getToken, putFavorite } from './api';
import { getFavorites as getLocalFavorites, toggleFavorite as toggleLocalFavorite } from './settings';
import { getItem, setItem } from './storage';

const K_FAVS = 'aurelius.favorites';
const K_QUEUE = 'aurelius.pendingOps';

type PendingOp = { quoteId: string; op: 'add' | 'remove' };

/**
 * Lokal-first-Favoriten mit optionalem Konto-Sync (Spec §6) — gleiche
 * Logik wie die Kotlin-App: ohne Session rein lokal; mit Session
 * optimistisch lokal + API, Fehler landen in einer Offline-Queue.
 */
export async function getFavorites(): Promise<string[]> {
  return getLocalFavorites();
}

async function getQueue(): Promise<PendingOp[]> {
  const v = await getItem(K_QUEUE);
  if (!v) return [];
  try {
    const parsed: unknown = JSON.parse(v);
    return Array.isArray(parsed) ? (parsed as PendingOp[]) : [];
  } catch {
    return [];
  }
}

async function setQueue(queue: PendingOp[]): Promise<void> {
  await setItem(K_QUEUE, JSON.stringify(queue));
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const next = await toggleLocalFavorite(id);
  const isFav = next.includes(id);
  if (await getToken()) {
    try {
      if (isFav) await putFavorite(id);
      else await deleteFavorite(id);
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'unauthorized') {
        // Session wurde in api.ts beendet — lokale Favoriten bleiben.
      } else {
        await setQueue([...(await getQueue()), { quoteId: id, op: isFav ? 'add' : 'remove' }]);
      }
    }
  }
  return next;
}

/**
 * Merge beim Login: alle lokalen Favoriten hochladen (PUT ist idempotent),
 * dann die Server-Gesamtliste übernehmen — Vereinigung, nichts geht verloren.
 */
export async function onLogin(): Promise<void> {
  for (const id of await getLocalFavorites()) {
    try {
      await putFavorite(id);
    } catch {
      // idempotent — Reste holt flushQueue nach
    }
  }
  const server = await getServerFavorites();
  await setItem(K_FAVS, JSON.stringify(server));
  await flushQueue();
}

/** Offline-Queue abarbeiten; bei Fehlern bleibt der Rest für später. */
export async function flushQueue(): Promise<void> {
  if (!(await getToken())) return;
  const queue = await getQueue();
  for (const [i, op] of queue.entries()) {
    try {
      if (op.op === 'add') await putFavorite(op.quoteId);
      else await deleteFavorite(op.quoteId);
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'unauthorized') {
        await setQueue([]);
      } else {
        await setQueue(queue.slice(i));
      }
      return;
    }
  }
  await setQueue([]);
}
