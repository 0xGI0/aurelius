import { getItem, setItem, deleteItem } from './storage';

// Alle Storage-Keys aus der Aurelius-Zeit (Stand v0.3.0). Der Shim läuft
// bei jedem App-Start; nach der ersten Migration ist er ein No-op.
const LEGACY_KEYS = [
  'token', 'email',            // lib/api.ts
  'favorites', 'pendingOps',   // lib/favorites.ts
  'quoteLang', 'theme', 'anthropicKey', 'author', // lib/settings.ts
  'uiLang',                    // lib/i18n.ts
];

export async function migrateLegacyStorage(): Promise<void> {
  for (const suffix of LEGACY_KEYS) {
    const legacy = await getItem(`aurelius.${suffix}`);
    if (legacy === null) continue;
    if ((await getItem(`stoa.${suffix}`)) === null) {
      await setItem(`stoa.${suffix}`, legacy);
    }
    await deleteItem(`aurelius.${suffix}`);
  }

  // Seneca-Paragraphen-Umbau (2026-08-05): Kapitel-Favoriten s-N heben wir
  // auf den ersten Paragraphen des Kapitels (s-N-1). Idempotent.
  const favs = await getItem('stoa.favorites');
  if (favs !== null) {
    try {
      const ids = JSON.parse(favs) as string[];
      const migrated = ids.map((id) => (/^s-\d+$/.test(id) ? `${id}-1` : id));
      if (migrated.some((id, i) => id !== ids[i])) {
        await setItem('stoa.favorites', JSON.stringify(migrated));
      }
    } catch {
      /* defektes JSON — Favoriten-Modul behandelt das selbst */
    }
  }
}
