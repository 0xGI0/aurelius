import type { Author, Quote } from './quotes';
import { AUREL_QUOTES, EPIKTET_QUOTES, SENECA_QUOTES, quotesFor } from './corpus';
import topicsData from '../data/topics.json';

const ALL: Quote[] = [...AUREL_QUOTES, ...EPIKTET_QUOTES, ...SENECA_QUOTES];

interface TopicEntry {
  id: string;
  label: string;
  quoteIds: string[];
}

// EN-Labels gespiegelt aus lib/i18n.ts (topic_*) — die API braucht den
// Katalog sprachneutral, ohne das UI-Wörterbuch zu importieren.
const TOPIC_EN: Record<string, string> = {
  tod: 'Death & Impermanence',
  wut: 'Anger & Forgiveness',
  trauer: 'Grief & Consolation',
  angst: 'Fear & Courage',
  familie: 'Family & Fellow Humans',
  besitz: 'Possessions & Fame',
  gelassenheit: 'Equanimity & Adversity',
  pflicht: 'Duty & Action',
  natur: 'Nature & Fate',
};

/** Themen-Katalog der App: id + Label in beiden UI-Sprachen. */
export const TOPICS = (topicsData as TopicEntry[]).map((t) => ({
  id: t.id,
  label: { de: t.label, en: TOPIC_EN[t.id] ?? t.label },
}));

const TOPIC_IDS = new Map<string, Set<string>>(
  (topicsData as TopicEntry[]).map((t) => [t.id, new Set(t.quoteIds)]),
);

export function isTopic(id: string): boolean {
  return TOPIC_IDS.has(id);
}

export interface PickOptions {
  author?: Author;
  /** Themen-Filter, eine id aus TOPICS. */
  topic?: string;
  /** Filtert auf Zitate, deren de- UND en-Text höchstens so lang ist. */
  maxLen?: number;
  /** Zufallsquelle, injizierbar für Tests (Default Math.random). */
  rng?: () => number;
}

/** Zufälliges Zitat aus dem Korpus; null, wenn der Filter alles aussiebt. */
export function pickQuote({ author, topic, maxLen, rng = Math.random }: PickOptions = {}): Quote | null {
  let pool = author ? quotesFor(author) : ALL;
  if (topic !== undefined) {
    const ids = TOPIC_IDS.get(topic);
    if (ids === undefined) return null;
    pool = pool.filter((q) => ids.has(q.id));
  }
  if (maxLen !== undefined) {
    pool = pool.filter((q) => q.texts.de.length <= maxLen && q.texts.en.length <= maxLen);
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(rng() * pool.length)];
}
