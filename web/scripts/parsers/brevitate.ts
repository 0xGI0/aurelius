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
export interface BrevParagraph {
  chapter: number;
  paragraph: number;
  text: string;
}

const ROMAN_TO_NUM = new Map(
  ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX']
    .map((r, i) => [r, i + 1] as const),
);

/**
 * la.wikisource-Volltext mit klassischer Zählung: Kapitel als
 * <h2 id="IV.">IV.</h2>, Paragraphen als HighlightedAnchor-Spans "[1]".
 * Wikisource-Chrome (Edit-Links „recensere") liegt in eigenen Tags und
 * fällt beim Zerlegen weg.
 */
export function parseBrevLaNumbered(html: string): BrevParagraph[] {
  const out: BrevParagraph[] = [];
  const chapterBlocks = [...html.matchAll(/<h2 id="([IVX]+)\.">[\s\S]*?<\/div>([\s\S]*?)(?=<div class="mw-heading|<div class="printfooter")/g)];
  for (const [, roman, block] of chapterBlocks) {
    const chapter = ROMAN_TO_NUM.get(roman);
    if (chapter === undefined) continue;
    // Kapitel XX schleppt sonst den Fußnoten-Apparat der Seite mit (↑ …)
    const cleanBlock = block.split('\u2191')[0];
    const pieces = cleanBlock.split(/<span id="&#91;\d+&#93;"[^>]*>\[(\d+)\]<\/span>/);
    // split liefert [vor, num1, text1, num2, text2, …]
    for (let i = 1; i < pieces.length; i += 2) {
      const text = pieces[i + 1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#91;\s*\d+\s*&#93;|\[\s*\d+\s*\]/g, '')
        .replace(/&#160;|&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) out.push({ chapter, paragraph: Number(pieces[i]), text });
    }
  }
  return out;
}

export function parseBrevLa(html: string): BrevChapter[] {
  const m = html.match(/<div class="mw-parser-output">([\s\S]*?)<div class="printfooter"/);
  const body = m ? m[1] : html;
  const paras = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((p) =>
      p[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&#91;\s*\d+\s*&#93;|\[\s*\d+\s*\]/g, '')
        .replace(/&#160;|&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((t) => t.length > 0);
  return paras.map((text, i) => ({ chapter: i + 1, text }));
}
