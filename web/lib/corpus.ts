import type { Author, Quote, QuoteLang } from './quotes';
import { formatReference } from './quotes';
import quotesData from '../data/quotes.json';
import enchiridionData from '../data/enchiridion.json';
import debrevitateData from '../data/debrevitate.json';

interface ChapterEntry {
  id: string;
  chapter: number;
  texts: Record<QuoteLang, string>;
}

interface ParagraphEntry extends ChapterEntry {
  paragraph: number;
}

const asQuotes = (entries: ChapterEntry[]): Quote[] =>
  entries.map((c) => ({ id: c.id, book: 0, section: c.chapter, texts: c.texts }));

export const AUREL_QUOTES = quotesData as Quote[];

/** Epiktets Encheiridion in Quote-Form: book 0, section = Kapitel. */
export const EPIKTET_QUOTES: Quote[] = asQuotes(enchiridionData as ChapterEntry[]);

/**
 * Senecas De brevitate vitae in Paragraphen-Einheiten (klassische Zählung,
 * seit 2026-08-05): book = Kapitel, section = Paragraph. Der 'grc'-Slot
 * trägt hier das LATEINISCHE Original.
 */
export const SENECA_QUOTES: Quote[] = (debrevitateData as ParagraphEntry[]).map((p) => ({
  id: p.id,
  book: p.chapter,
  section: p.paragraph,
  texts: p.texts,
}));

const INDEX = new Map<string, Quote>(
  [...AUREL_QUOTES, ...EPIKTET_QUOTES, ...SENECA_QUOTES].map((q) => [q.id, q]),
);

export function byId(id: string): Quote | undefined {
  return INDEX.get(id);
}

export function quotesFor(author: Author): Quote[] {
  if (author === 'epiktet') return EPIKTET_QUOTES;
  if (author === 'seneca') return SENECA_QUOTES;
  return AUREL_QUOTES;
}

export function idsFor(author: Author): string[] {
  return quotesFor(author).map((q) => q.id);
}

export function isEpiktetId(id: string): boolean {
  return id.startsWith('e-');
}

export function authorOf(id: string): Author {
  if (id.startsWith('e-')) return 'epiktet';
  if (id.startsWith('s-')) return 'seneca';
  return 'aurel';
}

/**
 * "Buch IV, 7" (Marc Aurel), "Handbuch, 5" (Epiktet), "De brevitate 4,2"
 * (Seneca — lateinischer Titel + klassische Kapitel,Paragraph-Stelle,
 * in beiden UI-Sprachen gleich).
 */
export function referenceLabel(q: Quote, bookWord: string, manualWord: string): string {
  const author = authorOf(q.id);
  if (author === 'epiktet') return `${manualWord}, ${q.section}`;
  if (author === 'seneca') return `De brevitate ${q.book},${q.section}`;
  return formatReference(q, bookWord);
}
