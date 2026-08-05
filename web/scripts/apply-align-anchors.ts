import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Füllt ein Alignment-Kapitel aus Start-Ankern: Für jeden Paragraphen ab
 * dem zweiten wird der exakte Anfangssatz (Präfix) in de und en angegeben;
 * Paragraph 1 beginnt am Kapitelanfang. Das Skript schneidet die
 * _deChapter/_enChapter-Arbeitstexte an den Ankern, prüft Eindeutigkeit
 * und strikte Reihenfolge und entfernt die Arbeitsfelder.
 *
 * Aufruf: npx tsx scripts/apply-align-anchors.ts <kapNr> <anchors.json>
 * anchors.json: [{ id: "s-4-2", de: "Der selige Augustus,", en: "The deified Augustus," }, …]
 */
const [, , kapArg, anchorsPath] = process.argv;
const kap = String(Number(kapArg)).padStart(2, '0');
const path = `data-sources/seneca-align/kap-${kap}.json`;

interface Row { id: string; la: string; de: string; en: string; _deChapter?: string; _enChapter?: string }
interface Anchor { id: string; de: string; en: string }

const rows = JSON.parse(readFileSync(path, 'utf8')) as Row[];
const anchors = JSON.parse(readFileSync(anchorsPath, 'utf8')) as Anchor[];

if (anchors.length !== rows.length - 1) {
  throw new Error(`${anchors.length} Anker, erwartet ${rows.length - 1} (Paragraphen ab dem zweiten)`);
}
const deChapter = rows[0]._deChapter ?? '';
const enChapter = rows[0]._enChapter ?? '';
if (!deChapter || !enChapter) throw new Error('Arbeitstexte _deChapter/_enChapter fehlen');

function cutPoints(chapter: string, keys: string[], lang: string): number[] {
  const points: number[] = [];
  let last = 0;
  for (const key of keys) {
    const first = chapter.indexOf(key);
    if (first < 0) throw new Error(`${lang}-Anker nicht gefunden: "${key.slice(0, 60)}…"`);
    if (chapter.indexOf(key, first + 1) >= 0) throw new Error(`${lang}-Anker mehrdeutig: "${key.slice(0, 60)}…"`);
    if (first <= last) throw new Error(`${lang}-Anker außer Reihenfolge: "${key.slice(0, 60)}…"`);
    points.push(first);
    last = first;
  }
  return points;
}

const dePoints = cutPoints(deChapter, anchors.map((a) => a.de), 'de');
const enPoints = cutPoints(enChapter, anchors.map((a) => a.en), 'en');

for (let i = 0; i < rows.length; i++) {
  const deStart = i === 0 ? 0 : dePoints[i - 1];
  const deEnd = i < dePoints.length ? dePoints[i] : deChapter.length;
  const enStart = i === 0 ? 0 : enPoints[i - 1];
  const enEnd = i < enPoints.length ? enPoints[i] : enChapter.length;
  if (i > 0 && anchors[i - 1].id !== rows[i].id) {
    throw new Error(`Anker-ID ${anchors[i - 1].id} passt nicht zu Zeile ${rows[i].id}`);
  }
  rows[i].de = deChapter.slice(deStart, deEnd).trim();
  rows[i].en = enChapter.slice(enStart, enEnd).trim();
}
delete rows[0]._deChapter;
delete rows[0]._enChapter;

writeFileSync(path, JSON.stringify(rows, null, 2));
const ratios = rows.map((r) => `${r.id}: de/la=${(r.de.length / r.la.length).toFixed(2)} en/la=${(r.en.length / r.la.length).toFixed(2)}`);
console.log(`${path} gefüllt\n` + ratios.join('\n'));
