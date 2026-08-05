import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parseBrevDe, parseBrevEn, parseBrevLaNumbered } from './parsers/brevitate';

/**
 * Einmaliges Gerüst fürs Satz-für-Satz-Alignment: pro Kapitel eine Datei
 * data-sources/seneca-align/kap-NN.json mit gefülltem `la` und leeren
 * `de`/`en`; die vollständigen Kapiteltexte liegen als `_deChapter` /
 * `_enChapter` im ersten Eintrag bei (der Build ignoriert Unterstrich-Felder
 * und leere IDs). Bereits gefüllte Dateien werden NICHT überschrieben.
 */
const la = parseBrevLaNumbered(readFileSync('data-sources/seneca-brevitate-la-numbered.html', 'utf8'));
const de = new Map(parseBrevDe(readFileSync('data-sources/seneca-brevitate-de.txt', 'utf8')).map((c) => [c.chapter, c.text]));
const en = new Map(parseBrevEn(readFileSync('data-sources/seneca-brevitate-en.json', 'utf8')).map((c) => [c.chapter, c.text]));

mkdirSync('data-sources/seneca-align', { recursive: true });
for (let c = 1; c <= 20; c++) {
  const path = `data-sources/seneca-align/kap-${String(c).padStart(2, '0')}.json`;
  try {
    const existing = JSON.parse(readFileSync(path, 'utf8'));
    if (existing.some((p: { de?: string }) => p.de)) {
      console.log(`${path}: schon gefüllt, übersprungen`);
      continue;
    }
  } catch { /* Datei fehlt → anlegen */ }
  const paras = la.filter((p) => p.chapter === c);
  const rows = paras.map((p, i) => ({
    id: `s-${c}-${p.paragraph}`,
    la: p.text,
    de: '',
    en: '',
    ...(i === 0 ? { _deChapter: de.get(c) ?? '', _enChapter: en.get(c) ?? '' } : {}),
  }));
  writeFileSync(path, JSON.stringify(rows, null, 2));
  console.log(`${path}: ${rows.length} Paragraphen`);
}
