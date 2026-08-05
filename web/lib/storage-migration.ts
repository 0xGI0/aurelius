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
}
