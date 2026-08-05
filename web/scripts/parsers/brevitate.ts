// Parser für Senecas De brevitate vitae — drei Quellen, 20 Kapitel.

export interface BrevChapter {
  chapter: number;
  text: string;
}

/**
 * Otto Apelt 1923 (Internet-Archive-Text, UTF-8-konvertiert): Kapitel als
 * "1. Text…" bis "20. Text…"; Einleitung/Inhaltsübersicht davor und der
 * Abschnitt "Anmerkungen" danach werden verworfen, ebenso die
 * Fußnotenmarken "N)" im Fließtext.
 */
export function parseBrevDe(raw: string): BrevChapter[] {
  let body = raw;
  const notes = body.search(/^Anmerkungen\s*$/m);
  if (notes > 0) body = body.slice(0, notes);

  const chapters: BrevChapter[] = [];
  const re = /^(\d{1,2})\.\s+([\s\S]*?)(?=^\d{1,2}\.\s+|$)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const n = Number(m[1]);
    if (n < 1 || n > 20) continue;
    const text = m[2]
      .replace(/\d+\)/g, '') // Fußnotenmarken
      .replace(/\s+/g, ' ')
      .trim();
    if (text) chapters.push({ chapter: n, text });
  }
  return chapters.sort((a, b) => a.chapter - b.chapter);
}

/** Basore 1932 (Wikisource, vorextrahiert als JSON: [{chapter, text}]). */
export function parseBrevEn(rawJson: string): BrevChapter[] {
  const list = JSON.parse(rawJson) as BrevChapter[];
  return list
    .map((c) => ({ chapter: c.chapter, text: c.text.replace(/\s+/g, ' ').trim() }))
    .filter((c) => c.text.length > 0)
    .sort((a, b) => a.chapter - b.chapter);
}

/**
 * Lateinisches Original (la.wikisource): der Seitenkörper enthält genau
 * 20 nicht-leere <p>-Absätze — einer pro Kapitel; "[N]"-Ankermarken werden
 * entfernt.
 */
export function parseBrevLa(html: string): BrevChapter[] {
  const m = html.match(/<div class="mw-parser-output">([\s\S]*?)<div class="printfooter"/);
  const body = m ? m[1] : html;
  const paras = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((p) =>
      p[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#91;\d+&#93;|\[\d+\]/g, '')
        .replace(/&#160;|&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((t) => t.length > 0);
  return paras.map((text, i) => ({ chapter: i + 1, text }));
}
