// Parser für den englischen Marc-Aurel-Text (Project Gutenberg #2680,
// "Meditations", https://www.gutenberg.org/cache/epub/2680/pg2680.txt).
//
// Buchüberschriften ("THE FIRST BOOK" … "THE TWELFTH BOOK") und
// Abschnittsnummerierung (römische Zahl + Punkt + Leerzeichen am
// Zeilenanfang, z. B. "I. Text") entsprechen der ursprünglichen
// Brief-Annahme — hier war keine Anpassung nötig. Die reale Datei enthält
// aber zusätzliches Beiwerk, das die einfache Annahme nicht behandelt hätte
// (siehe __tests__/en.test.ts für dokumentierte Beispiele):
//
//  1. Zeilenenden sind CRLF (\r\n); `trim()` entfernt das \r automatisch.
//  2. Zwischen dem Gutenberg-Start-Marker und der ersten echten
//     Buchüberschrift steht viel Beiwerk (Inhaltsverzeichnis, Einleitung,
//     eine Widmung "HIS FIRST BOOK" mit eigenem Zitat). Das ist
//     unproblematisch: keine dieser Zeilen passt exakt auf
//     "THE (\w+) BOOK", der Parser bleibt bis zur ersten echten
//     Buchüberschrift im book===0-Zustand und verwirft alles.
//  3. NACH "THE TWELFTH BOOK" folgt vor dem Gutenberg-Ende-Marker ein
//     "APPENDIX" (Briefwechsel mit Fronto) sowie "NOTES" und "GLOSSARY".
//     Der Appendix-Text enthält selbst römisch nummerierte Zeilen
//     (Briefnummern, Fußnotenverweise), die sonst fälschlich als
//     Fortsetzung von Buch XII geparst würden. Wird daher explizit an der
//     "APPENDIX"-Zeile nach "THE TWELFTH BOOK" abgeschnitten.
//  4. Am Ende von Buch II steht eine alleinstehende, komplett kursivierte
//     Kolophon-Zeile ("_Whilst I was at Carnuntum._", eine Orts-/
//     Datumsangabe). Sie ist kein Abschnittstext und wird verworfen
//     (Erkennung: gesamte Zeile in "_..._" eingeschlossen).
//  5. Einzelne Wörter/Phrasen mitten im Fließtext sind ebenfalls per
//     Unterstrich kursiviert (z. B. "_Hypomnemata_"). Diese
//     Kursiv-Markup-Unterstriche werden aus dem Ergebnistext entfernt.
//  6. Fußnoten in eckigen Klammern kommen im Fließtext der 12 Bücher NICHT
//     vor (eine Durchsuchung des gesamten Buch-Bereichs auf "[" ergab
//     keinen Treffer; eckige Klammern tauchen nur im abgeschnittenen
//     Appendix/Notes-Beiwerk auf) — es gibt daher keine
//     Fußnoten-Erkennung im Fließtext zu implementieren.
//  7. Manche Bücher haben in dieser Ausgabe Lücken in der fortlaufenden
//     Nummerierung (z. B. Buch II springt von "IV." zu "VI.", kein
//     Abschnitt V). Das ist eine echte Eigenheit der Quelle, keine
//     Fußnote — die römischen Zahlen werden wörtlich übernommen, ohne eine
//     "erwartete nächste Nummer" durchzusetzen (anders als im DE-Parser,
//     der das zur Fußnoten-Disambiguierung braucht; hier gibt es keine
//     Fußnoten im Fließtext, die verwechselt werden könnten).

const BOOK_WORDS: Record<string, number> = {
  FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4, FIFTH: 5, SIXTH: 6,
  SEVENTH: 7, EIGHTH: 8, NINTH: 9, TENTH: 10, ELEVENTH: 11, TWELFTH: 12,
};

function romanToInt(r: string): number {
  const vals: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  let total = 0;
  for (let i = 0; i < r.length; i++) {
    const cur = vals[r[i]];
    const next = vals[r[i + 1]] ?? 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}

const BOOK_RE = /^THE (\w+) BOOK$/;
const SECTION_RE = /^([IVXLC]+)\.\s+(.*)$/;
// Alleinstehende, komplett kursivierte Zeile (Gutenberg-Konvention:
// Kursivierung durch umschließende Unterstriche) — ein editorieller
// Kolophon-/Orts-Hinweis wie "_Whilst I was at Carnuntum._" am Ende von
// Buch II, kein Abschnittstext.
const ITALIC_NOTE_RE = /^_.*_[.,;:]?$/;

export interface ParsedSection {
  book: number;
  section: number;
  text: string;
}

export function parseEn(raw: string): ParsedSection[] {
  const startIdx = raw.indexOf('*** START');
  const endIdx = raw.indexOf('*** END');
  let body = raw.slice(
    startIdx >= 0 ? raw.indexOf('\n', startIdx) + 1 : 0,
    endIdx >= 0 ? endIdx : raw.length
  );

  // Appendix/Notes/Glossary nach Buch XII abschneiden (siehe Punkt 3 oben).
  const twelfthIdx = body.search(/\n\s*THE TWELFTH BOOK\s*\r?\n/);
  const appendixIdx = twelfthIdx >= 0 ? body.indexOf('\nAPPENDIX', twelfthIdx) : -1;
  if (appendixIdx >= 0) body = body.slice(0, appendixIdx);

  const out: ParsedSection[] = [];
  let book = 0;
  let section = 0;
  let buf: string[] = [];

  const flush = () => {
    if (book > 0 && section > 0 && buf.length > 0) {
      const text = buf.join(' ').replace(/\s+/g, ' ').trim().replace(/_/g, '');
      out.push({ book, section, text });
    }
    buf = [];
  };

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    const bookMatch = line.match(BOOK_RE);
    if (bookMatch && BOOK_WORDS[bookMatch[1]] !== undefined) {
      flush();
      book = BOOK_WORDS[bookMatch[1]];
      section = 0;
      continue;
    }
    if (book === 0) continue;
    if (ITALIC_NOTE_RE.test(line)) continue;
    const m = line.match(SECTION_RE);
    if (m) {
      flush();
      section = romanToInt(m[1]);
      buf = [m[2]];
    } else if (section > 0 && line.length > 0) {
      buf.push(line);
    }
  }
  flush();
  return out;
}
