// Parser für Epiktets Encheiridion — drei Quellen, ein Ziel:
// 53 Kapitel mit { chapter, text }.

export interface EnchChapter {
  chapter: number;
  text: string;
}

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };

export function romanToInt(s: string): number {
  let sum = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]];
    const next = ROMAN[s[i + 1]] ?? 0;
    sum += v < next ? -v : v;
  }
  return sum;
}

function joinLines(lines: string[]): string {
  // Silbentrennung am Zeilenende zusammenfügen, sonst mit Leerzeichen verbinden
  let out = '';
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (out.endsWith('-')) out = out.slice(0, -1) + t;
    else out = out ? `${out} ${t}` : t;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Conz 1864 (pdftotext-Ausgabe): Verse als "I, 1. Text…" oder Kapitel als
 * "XVII. Text…"; redaktionelle Zwischenüberschriften (Kurzzeile vor einem
 * Vers-Marker), Seitenköpfe und Seitenzahlen werden verworfen.
 */
export function parseEnchDe(raw: string): EnchChapter[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => !/^Epiktet$/.test(l))
    .filter((l) => !/^Handbüchlein$/.test(l))
    .filter((l) => !/^der stoischen Moral$/.test(l))
    .filter((l) => !/^\(Encheiridion\)$/.test(l))
    .filter((l) => !/^Epiktet: Handbüchlein der stoischen Moral$/.test(l))
    .filter((l) => !/^\d+$/.test(l));

  const marker = /^([IVXL]+)[,.]\s*(?:\d+\.)?\s*(.*)$/;
  const chapters = new Map<number, string[]>();
  let current = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') continue;
    const m = line.match(marker);
    if (m && romanToInt(m[1]) > 0) {
      current = romanToInt(m[1]);
      if (!chapters.has(current)) chapters.set(current, []);
      if (m[2]) chapters.get(current)!.push(m[2]);
      continue;
    }
    // Redaktionelle Zwischenüberschrift: steht nach einer Leerzeile (bzw. am
    // Anfang) und unmittelbar VOR einer Marker-Zeile — wird verworfen.
    const prevBlank = i === 0 || lines[i - 1] === '';
    const nextIsMarker = i + 1 < lines.length && marker.test(lines[i + 1]);
    if (prevBlank && nextIsMarker) continue;
    if (current > 0) chapters.get(current)!.push(line);
  }

  return [...chapters.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([chapter, parts]) => ({ chapter, text: joinLines(parts) }))
    .filter((c) => c.text.length > 0);
}

/**
 * George Long 1877 (Project Gutenberg #10661): Abschnitt nach der zweiten
 * Zeile "THE ENCHEIRIDION, OR MANUAL."; Kapitelmarken sind römische Zahlen
 * allein auf einer Zeile ("I."), Ende bei FOOTNOTES/PG-Lizenz.
 * "[Greek: …]"-Transliterations-Glossen werden entfernt.
 */
export function parseEnchEn(raw: string): EnchChapter[] {
  const startIdx = raw.lastIndexOf('THE ENCHEIRIDION, OR MANUAL.');
  let body = startIdx >= 0 ? raw.slice(startIdx) : raw;
  const endMatch = body.search(/^\s*(FOOTNOTES|\*\*\* END OF)/m);
  if (endMatch > 0) body = body.slice(0, endMatch);
  body = body.replace(/\[Greek:[^\]]*\]/g, '');

  const lines = body.split('\n');
  const chapters = new Map<number, string[]>();
  let current = 0;
  let buffer: string[] = [];

  const flush = () => {
    if (current > 0 && buffer.length) {
      if (!chapters.has(current)) chapters.set(current, []);
      const text = joinLines(buffer);
      if (text) chapters.get(current)!.push(text);
    }
    buffer = [];
  };

  for (const line of lines) {
    const m = line.trim().match(/^([IVXL]+)\.\s*$/);
    if (m && romanToInt(m[1]) > 0) {
      flush();
      current = romanToInt(m[1]);
      continue;
    }
    buffer.push(line);
  }
  flush();

  const result = [...chapters.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([chapter, parts]) => ({
      chapter,
      text: parts.join(' ').replace(/\s+/g, ' ').trim(),
    }))
    .filter((c) => c.text.length > 0);

  // Longs Edition verschmilzt Kap. 50+51 und zählt danach eins zu wenig
  // (sein LI/LII = griechisch 52/53). Am dokumentierten Satzanfang trennen
  // und die Folgekapitel zurückschieben:
  const SPLIT = 'How long will you then still defer';
  const ch50 = result.find((c) => c.chapter === 50);
  if (result.length === 52 && ch50 && ch50.text.includes(SPLIT)) {
    const idx = ch50.text.indexOf(SPLIT);
    const tail = ch50.text.slice(idx).trim();
    ch50.text = ch50.text.slice(0, idx).trim();
    for (const c of result) {
      if (c.chapter >= 51) c.chapter += 1;
    }
    result.push({ chapter: 51, text: tail });
    result.sort((a, b) => a.chapter - b.chapter);
  }
  return result;
}

/** PerseusDL TEI (tlg0557.tlg002): <div type="chapter" n="N">…</div>. */
export function parseEnchGrc(xml: string): EnchChapter[] {
  const chapters: EnchChapter[] = [];
  const re = /<div[^>]*type="chapter"[^>]*n="(\d+)"[^>]*>([\s\S]*?)<\/div>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const text = m[2]
      .replace(/<note[\s\S]*?<\/note>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) chapters.push({ chapter: Number(m[1]), text });
  }
  return chapters.sort((a, b) => a.chapter - b.chapter);
}
