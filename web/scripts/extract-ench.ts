import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseEnchDe, parseEnchEn, parseEnchGrc } from './parsers/ench';

const dePdf = 'data-sources/Epiktet-Handbuechlein-Conz.pdf';
const deRaw = execFileSync('pdftotext', ['-enc', 'UTF-8', dePdf, '-'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const de = parseEnchDe(deRaw);
const en = parseEnchEn(readFileSync('data-sources/pg-long-enchiridion.txt', 'utf8'));
const grc = parseEnchGrc(readFileSync('data-sources/tlg0557.tlg002.xml', 'utf8'));

for (const [lang, list] of [['de', de], ['en', en], ['grc', grc]] as const) {
  const chapters = list.map((c) => c.chapter);
  const missing = [];
  for (let i = 1; i <= 53; i++) if (!chapters.includes(i)) missing.push(i);
  console.log(`${lang}: ${list.length} Kapitel${missing.length ? ` — FEHLT: ${missing.join(', ')}` : ' ✓'}`);
}

mkdirSync('data-sources/extracted', { recursive: true });
writeFileSync('data-sources/extracted/ench-de.json', JSON.stringify(de, null, 1));
writeFileSync('data-sources/extracted/ench-en.json', JSON.stringify(en, null, 1));
writeFileSync('data-sources/extracted/ench-grc.json', JSON.stringify(grc, null, 1));
