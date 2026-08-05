import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Author } from '../lib/quotes';
import { authorOf, referenceLabel } from '../lib/corpus';
import { isTopic, pickQuote } from '../lib/quote-pick';

const AUTHORS = new Set<Author>(['aurel', 'epiktet', 'seneca']);

const AUTHOR_NAME: Record<Author, { de: string; en: string }> = {
  aurel: { de: 'Marc Aurel', en: 'Marcus Aurelius' },
  epiktet: { de: 'Epiktet', en: 'Epictetus' },
  seneca: { de: 'Seneca', en: 'Seneca' },
};

const WORK: Record<Author, { de: string; en: string }> = {
  aurel: { de: 'Selbstbetrachtungen', en: 'Meditations' },
  epiktet: { de: 'Handbüchlein der Moral', en: 'Enchiridion' },
  seneca: { de: 'Von der Kürze des Lebens', en: 'On the Shortness of Life' },
};

/**
 * Öffentliche Zitate-API: GET /api/quote[?author=…&maxLen=…]
 * Die Texte sind gemeinfrei, daher CORS offen; no-store, weil eine
 * zufällige Antwort nicht am CDN kleben darf.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'nur GET' });
    return;
  }

  const authorParam = typeof req.query.author === 'string' ? req.query.author : undefined;
  if (authorParam !== undefined && !AUTHORS.has(authorParam as Author)) {
    res.status(400).json({ error: 'author muss aurel, epiktet oder seneca sein' });
    return;
  }
  const author = authorParam as Author | undefined;

  const topic = typeof req.query.topic === 'string' ? req.query.topic : undefined;
  if (topic !== undefined && !isTopic(topic)) {
    res.status(400).json({ error: 'unbekanntes topic' });
    return;
  }

  let maxLen: number | undefined;
  if (typeof req.query.maxLen === 'string') {
    const n = Number.parseInt(req.query.maxLen, 10);
    if (Number.isNaN(n)) {
      res.status(400).json({ error: 'maxLen muss eine Zahl sein' });
      return;
    }
    maxLen = Math.min(Math.max(n, 40), 2000);
  }

  const q = pickQuote({ author, topic, maxLen });
  if (q === null) {
    res.status(404).json({ error: 'kein Zitat im Filter' });
    return;
  }

  const a = authorOf(q.id);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    id: q.id,
    author: a,
    authorName: AUTHOR_NAME[a],
    work: WORK[a],
    // Neutral gegenüber dem Werktitel (der steht separat in `work`), damit
    // Anzeigen wie „Werk, Referenz" sich nicht doppeln: Kapitel-Werke
    // bekommen schlicht „Kap./Ch. n".
    ref:
      a === 'aurel'
        ? { de: referenceLabel(q, 'Buch', ''), en: referenceLabel(q, 'Book', '') }
        : { de: `Kap. ${q.section}`, en: `Ch. ${q.section}` },
    // Datenformat der App: bei Seneca trägt der grc-Slot das Latein.
    texts: q.texts,
  });
}
