import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

export class GateError extends Error {}

export interface AlignPara {
  id: string;
  la: string;
  de: string;
  en: string;
}

export interface BrevEntry {
  id: string;
  chapter: number;
  paragraph: number;
  texts: { de: string; en: string; grc: string };
}

/**
 * Baut die Paragraphen-Einträge aus den geprüften Alignment-Kapiteln.
 * Gates (Spec 2026-08-05): keine leeren Slots, lückenlose Paragraphenfolge,
 * Längenkorridore je Paragraph de/la ∈ [1,1–2,0], en/la ∈ [1,1–1,7].
 * Hinweis: der 'grc'-Slot trägt bei Seneca das LATEINISCHE Original —
 * der Slot bedeutet app-weit "Originalsprache" (siehe data/SOURCES.md).
 */
export function buildBrevitate(chapters: AlignPara[][]): BrevEntry[] {
  const entries: BrevEntry[] = [];
  for (const paras of chapters) {
    paras.forEach((p, pi) => {
      const m = p.id.match(/^s-(\d+)-(\d+)$/);
      if (!m) throw new GateError(`${p.id}: ID-Format`);
      const [, chap, par] = m;
      if (Number(par) !== pi + 1) throw new GateError(`${p.id}: Paragraphen-Sprung (Position ${pi + 1})`);
      for (const k of ['la', 'de', 'en'] as const) {
        if (!p[k].trim()) throw new GateError(`${p.id}: ${k} leer`);
      }
      const rDe = p.de.length / p.la.length;
      const rEn = p.en.length / p.la.length;
      if (rDe < 1.1 || rDe > 2.0) throw new GateError(`${p.id}: de/la=${rDe.toFixed(2)}`);
      if (rEn < 1.1 || rEn > 1.7) throw new GateError(`${p.id}: en/la=${rEn.toFixed(2)}`);
      entries.push({
        id: p.id,
        chapter: Number(chap),
        paragraph: Number(par),
        texts: { de: p.de, en: p.en, grc: p.la },
      });
    });
  }
  return entries;
}

function main() {
  const dir = 'data-sources/seneca-align';
  const files = readdirSync(dir).filter((f) => /^kap-\d\d\.json$/.test(f)).sort();
  if (files.length !== 20) throw new GateError(`${files.length} Kapitel-Dateien, erwartet 20`);
  const chapters = files.map((f) =>
    (JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as (AlignPara & Record<string, unknown>)[])
      .filter((p) => p.id)
      .map(({ id, la, de, en }) => ({ id, la, de, en })),
  );
  const entries = buildBrevitate(chapters);

  // Kapitel-Korridor: aggregiertes de/la je Kapitel in [1,3–1,7]
  for (let c = 1; c <= 20; c++) {
    const chapEntries = entries.filter((e) => e.chapter === c);
    const de = chapEntries.reduce((s, e) => s + e.texts.de.length, 0);
    const la = chapEntries.reduce((s, e) => s + e.texts.grc.length, 0);
    const r = de / la;
    if (r < 1.3 || r > 1.7) throw new GateError(`Kapitel ${c}: de/la=${r.toFixed(2)} (erwartet 1,3–1,7)`);
  }

  writeFileSync('data/debrevitate.json', JSON.stringify(entries));
  console.log(`data/debrevitate.json: ${entries.length} Paragraphen in 20 Kapiteln ✓`);
}

if (process.argv[1]?.includes('build-brevitate')) main();
