import { readFileSync, writeFileSync } from 'node:fs';

export interface Section { book: number; section: number; text: string }
export type Lang = 'de' | 'en' | 'grc';
export type Remap = Record<Lang, Record<string, string>>;

export interface MergeResult {
  quotes: Array<{ id: string; book: number; section: number; texts: Record<Lang, string> }>;
  missing: Array<{ id: string; lacking: Lang[] }>;
}

export function mergeSections(sources: Record<Lang, Section[]>, remap: Remap): MergeResult {
  const maps: Record<Lang, Map<string, string>> = { de: new Map(), en: new Map(), grc: new Map() };
  for (const lang of ['de', 'en', 'grc'] as Lang[]) {
    for (const s of sources[lang]) {
      const rawId = `${s.book}-${s.section}`;
      const id = remap[lang][rawId] ?? rawId;
      maps[lang].set(id, s.text);
    }
  }
  const allIds = new Set<string>([...maps.de.keys(), ...maps.en.keys(), ...maps.grc.keys()]);
  const quotes: MergeResult['quotes'] = [];
  const missing: MergeResult['missing'] = [];
  const sorted = [...allIds].sort((a, b) => {
    const [ab, as] = a.split('-').map(Number);
    const [bb, bs] = b.split('-').map(Number);
    return ab - bb || as - bs;
  });
  for (const id of sorted) {
    const lacking = (['de', 'en', 'grc'] as Lang[]).filter((l) => !maps[l].has(id));
    if (lacking.length === 0) {
      const [book, section] = id.split('-').map(Number);
      quotes.push({ id, book, section, texts: { de: maps.de.get(id)!, en: maps.en.get(id)!, grc: maps.grc.get(id)! } });
    } else {
      missing.push({ id, lacking });
    }
  }
  return { quotes, missing };
}

// CLI-Teil: nur ausführen, wenn direkt gestartet
if (process.argv[1]?.endsWith('build-quotes.ts')) {
  const load = (l: Lang) => JSON.parse(readFileSync(`data-sources/extracted/${l}.json`, 'utf8')) as Section[];
  const remap = JSON.parse(readFileSync('data-sources/overrides/remap.json', 'utf8')) as Remap;
  const { quotes, missing } = mergeSections({ de: load('de'), en: load('en'), grc: load('grc') }, remap);
  writeFileSync('data/quotes.json', JSON.stringify(quotes));
  const report = [
    `Vollständige Abschnitte: ${quotes.length}`,
    `Unvollständig: ${missing.length}`,
    ...missing.map((m) => `  ${m.id} fehlt in: ${m.lacking.join(', ')}`),
  ].join('\n');
  writeFileSync('data-sources/alignment-report.txt', report + '\n');
  console.log(report);
}
