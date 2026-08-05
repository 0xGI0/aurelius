import type { Author, Quote, QuoteLang } from './quotes';
import { formatReference } from './quotes';
import quotesData from '../data/quotes.json';
import enchiridionData from '../data/enchiridion.json';

interface EnchEntry {
  id: string;
  chapter: number;
  texts: Record<QuoteLang, string>;
}

export const AUREL_QUOTES = quotesData as Quote[];

/** Epiktets Encheiridion in Quote-Form: book 0, section = Kapitel. */
export const EPIKTET_QUOTES: Quote[] = (enchiridionData as EnchEntry[]).map((c) => ({
  id: c.id,
  book: 0,
  section: c.chapter,
  texts: c.texts,
}));

const INDEX = new Map<string, Quote>(
  [...AUREL_QUOTES, ...EPIKTET_QUOTES].map((q) => [q.id, q]),
);

export function byId(id: string): Quote | undefined {
  return INDEX.get(id);
}

export function quotesFor(author: Author): Quote[] {
  return author === 'epiktet' ? EPIKTET_QUOTES : AUREL_QUOTES;
}

export function idsFor(author: Author): string[] {
  return quotesFor(author).map((q) => q.id);
}

export function isEpiktetId(id: string): boolean {
  return id.startsWith('e-');
}

export function authorOf(id: string): Author {
  return isEpiktetId(id) ? 'epiktet' : 'aurel';
}

/** "Buch IV, 7" bzw. "Handbuch, 5" — Wörter kommen lokalisiert vom Aufrufer. */
export function referenceLabel(q: Quote, bookWord: string, manualWord: string): string {
  return isEpiktetId(q.id) ? `${manualWord}, ${q.section}` : formatReference(q, bookWord);
}
