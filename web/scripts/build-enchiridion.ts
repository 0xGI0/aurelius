import { readFileSync, writeFileSync } from 'node:fs';
import type { EnchChapter } from './parsers/ench';

const de = JSON.parse(readFileSync('data-sources/extracted/ench-de.json', 'utf8')) as EnchChapter[];
const en = JSON.parse(readFileSync('data-sources/extracted/ench-en.json', 'utf8')) as EnchChapter[];
const grc = JSON.parse(readFileSync('data-sources/extracted/ench-grc.json', 'utf8')) as EnchChapter[];

const maps = {
  de: new Map(de.map((c) => [c.chapter, c.text])),
  en: new Map(en.map((c) => [c.chapter, c.text])),
  grc: new Map(grc.map((c) => [c.chapter, c.text])),
};

const entries = [];
const missing: string[] = [];
for (let n = 1; n <= 53; n++) {
  const texts = {
    de: maps.de.get(n) ?? '',
    en: maps.en.get(n) ?? '',
    grc: maps.grc.get(n) ?? '',
  };
  for (const [lang, text] of Object.entries(texts)) {
    if (!text) missing.push(`e-${n} (${lang})`);
  }
  entries.push({ id: `e-${n}`, chapter: n, texts });
}

if (missing.length) {
  console.error('FEHLEND:', missing.join(', '));
  process.exit(1);
}
writeFileSync('data/enchiridion.json', JSON.stringify(entries));
console.log(`data/enchiridion.json: ${entries.length} Kapitel, alle drei Sprachen ✓`);
