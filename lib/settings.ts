import { getItem, setItem, deleteItem } from './storage';
import type { QuoteLang } from './quotes';
import type { ThemePref } from '../theme/tokens';

const K_LANG = 'aurelius.quoteLang';
const K_THEME = 'aurelius.theme';
const K_KEY = 'aurelius.anthropicKey';

const LANGS: QuoteLang[] = ['de', 'en', 'grc'];
const THEMES: ThemePref[] = ['light', 'dark', 'system'];

export async function getQuoteLang(): Promise<QuoteLang> {
  const v = await getItem(K_LANG);
  return LANGS.includes(v as QuoteLang) ? (v as QuoteLang) : 'de';
}

export async function setQuoteLang(l: QuoteLang): Promise<void> {
  await setItem(K_LANG, l);
}

export async function getThemePref(): Promise<ThemePref> {
  const v = await getItem(K_THEME);
  return THEMES.includes(v as ThemePref) ? (v as ThemePref) : 'system';
}

export async function setThemePref(p: ThemePref): Promise<void> {
  await setItem(K_THEME, p);
}

export async function getAnthropicKey(): Promise<string | null> {
  const v = await getItem(K_KEY);
  return v && v.length > 0 ? v : null;
}

export async function setAnthropicKey(key: string): Promise<void> {
  await setItem(K_KEY, key.trim());
}

export async function deleteAnthropicKey(): Promise<void> {
  await deleteItem(K_KEY);
}

const K_FAVS = 'aurelius.favorites';

export async function getFavorites(): Promise<string[]> {
  const v = await getItem(K_FAVS);
  if (!v) return [];
  try {
    const parsed: unknown = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const current = await getFavorites();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  await setItem(K_FAVS, JSON.stringify(next));
  return next;
}
