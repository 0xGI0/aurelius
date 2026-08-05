import { readFileSync, writeFileSync } from 'node:fs';
import { parseBrevDe, parseBrevEn, parseBrevLa } from './parsers/brevitate';

const de = parseBrevDe(readFileSync('data-sources/seneca-brevitate-de.txt', 'utf8'));
const en = parseBrevEn(readFileSync('data-sources/seneca-brevitate-en.json', 'utf8'));
const la = parseBrevLa(readFileSync('data-sources/seneca-brevitate-la.html', 'utf8'));

const maps = {
  de: new Map(de.map((c) => [c.chapter, c.text])),
  en: new Map(en.map((c) => [c.chapter, c.text])),
  la: new Map(la.map((c) => [c.chapter, c.text])),
};

const entries = [];
const missing: string[] = [];
for (let n = 1; n <= 20; n++) {
  // Hinweis: der 'grc'-Slot trägt bei Seneca das LATEINISCHE Original —
  // der Slot bedeutet app-weit "Originalsprache" (siehe data/SOURCES.md).
  const texts = {
    de: maps.de.get(n) ?? '',
    en: maps.en.get(n) ?? '',
    grc: maps.la.get(n) ?? '',
  };
  for (const [lang, text] of Object.entries(texts)) {
    if (!text) missing.push(`s-${n} (${lang})`);
  }
  entries.push({ id: `s-${n}`, chapter: n, texts });
}

if (missing.length) {
  console.error('FEHLEND:', missing.join(', '));
  process.exit(1);
}
writeFileSync('data/debrevitate.json', JSON.stringify(entries));
console.log(`data/debrevitate.json: ${entries.length} Kapitel, alle drei Sprachen ✓`);
