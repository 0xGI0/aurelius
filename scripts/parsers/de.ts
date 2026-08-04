// Parser für den deutschen Marc-Aurel-Text (Wittstock-Übersetzung, Reclam),
// nach Extraktion mit `pdftotext -layout -enc UTF-8`.
//
// Das reale pdftotext-Output weicht in mehreren Punkten von der ursprünglich
// angenommenen Form ab (siehe __tests__/de.test.ts für dokumentierte
// Beispiele):
//
//  1. Abschnittsnummern haben keinen Punkt: "1      Text ...", nicht "1. Text".
//  2. Der eingebettete Font der PDF hat keine echten Unicode-Mappings für die
//     historischen Ligaturen "ft", "tt", "fft", "fh" — pdftotext gibt dafür
//     Steuerzeichen (U+0001, U+0002, U+0005, U+0007) aus, die repariert
//     werden müssen (z. B. "Kra" -> "Kraft").
//  3. Seitenfußnoten beginnen mit demselben "N   Text"-Format wie Abschnitte
//     und stehen direkt im Fließtext (am Seitenende, vor der Seitenzahl).
//     Sie müssen verworfen werden. Da ihre Nummerierung fortlaufend durchs
//     ganze Buch läuft (nicht pro Abschnitt zurückgesetzt), kann eine
//     Fußnotennummer zufällig mit der als Nächstes erwarteten
//     Abschnittsnummer übereinstimmen — echte Abschnitte werden daher über
//     eine Kombination aus erwarteter Nummer UND einer Leerzeile davor
//     erkannt; solange wir "in einem Fußnotenblock" stecken (keine Leerzeile
//     seit der letzten Fußnote), gewinnt die Fußnoten-Interpretation.
//  4. Silbentrennung am Zeilenende ("getrenn-\nte") muss zu einem Wort
//     zusammengefügt werden.
//  5. Fußnotenverweise im Fließtext hängen als Ziffern ohne Leerzeichen an
//     ein Wort an ("Erzieher5") und müssen entfernt werden.
//  6. Kopfzeilen ("Marc Aurel – Selbstbetrachtungen ... <Kapitel>") können
//     ein Form-Feed-Zeichen (Seitenumbruch) vor sich haben; Seitenzahlen
//     stehen als "| N |".

const BOOKS: Record<string, number> = {
  'Erstes Buch': 1, 'Zweites Buch': 2, 'Drittes Buch': 3, 'Viertes Buch': 4,
  'Fünftes Buch': 5, 'Sechstes Buch': 6, 'Siebentes Buch': 7, 'Siebtes Buch': 7,
  'Achtes Buch': 8, 'Neuntes Buch': 9, 'Zehntes Buch': 10, 'Elftes Buch': 11,
  'Zwölftes Buch': 12,
};

// Steuerzeichen, auf die pdftotext defekte Ligatur-Glyphen des eingebetteten
// Fonts abbildet, ermittelt durch Abgleich mit dem tatsächlichen Fließtext.
const LIGATURES: Record<string, string> = {
  '': 'ft',
  '': 'tt',
  '': 'ffb',
  '': 'fft',
  '': 'fh',
};

const LIGATURE_RE = /[]/g;
const HEADER_RE = /^Marc Aurel\s*[–-]\s*Selbstbetrachtungen/;
const PAGENUM_RE = /^\|\s*\d+\s*\|$/;
const ORNAMENT_RE = /^\*+$/;
const NUM_RE = /^(\d{1,3})(?:\s+(\S.*))?$/;
const HYPHEN_END_RE = /[A-Za-zÀ-ÿ]-$/;
const FOOTNOTE_MARKER_RE = /([^\s\d])\d{1,3}(?!\d)/g;

export interface ParsedSection {
  book: number;
  section: number;
  text: string;
}

function repairLigatures(raw: string): string {
  return raw.replace(LIGATURE_RE, (ch) => LIGATURES[ch] ?? '');
}

/** Fügt Zeilen wieder zusammen, die durch Silbentrennung am Zeilenende
 * (Trennstrich, "-") auseinandergerissen wurden. */
function joinHyphenation(lines: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (HYPHEN_END_RE.test(line) && i + 1 < lines.length && lines[i + 1] !== '') {
      i += 1;
      line = line.slice(0, -1) + lines[i];
    }
    out.push(line);
  }
  return out;
}

function stripFootnoteMarkers(text: string): string {
  return text.replace(FOOTNOTE_MARKER_RE, '$1');
}

export function parseDe(raw: string): ParsedSection[] {
  const repaired = repairLigatures(raw);
  const rawLines = repaired.split('\n').map((l) => l.trim());
  const contentLines = rawLines.filter(
    (l) => !HEADER_RE.test(l) && !PAGENUM_RE.test(l) && !ORNAMENT_RE.test(l)
  );
  const lines = joinHyphenation(contentLines);

  const out: ParsedSection[] = [];
  let book = 0;
  let expected = 1;
  let blankRun = 0;
  // Sind wir gerade "in einem Fußnotenblock"? Solange das gilt, werden
  // fortlaufende Zeilen (Fortsetzung der Fußnote) verworfen, statt an den
  // gerade unterbrochenen Abschnitt angehängt zu werden. Ein Abschnitt wird
  // NICHT beim Auftreten einer Fußnote abgeschlossen (flush) — Fußnoten
  // stehen am Seitenende mitten im Abschnitt, sein Fließtext geht auf der
  // nächsten Seite weiter. Erst ein neuer echter Abschnitt (oder Buch/Ende)
  // schließt den aktuellen Abschnitt ab.
  let inFootnoteBlock = false;
  let curBook = 0;
  let curSection = 0;
  let buf: string[] = [];

  const flush = () => {
    if (curBook > 0 && curSection > 0 && buf.length > 0) {
      // NFKC zerlegt Unicode-Ligatur-Glyphen (ﬀ, ﬁ, ﬂ, ﬃ, ﬄ), die pdftotext
      // für "ff"/"fi"/"fl"/... ausgibt, in normale Buchstabenfolgen – sonst
      // würde z. B. eine Volltextsuche nach "Stoff" an "Stoﬀ" vorbeilaufen.
      const joined = buf.join(' ').replace(/\s+/g, ' ').trim().normalize('NFKC');
      const text = stripFootnoteMarkers(joined);
      out.push({ book: curBook, section: curSection, text });
    }
    buf = [];
    curBook = 0;
    curSection = 0;
  };

  for (const line of lines) {
    if (BOOKS[line] !== undefined) {
      flush();
      book = BOOKS[line];
      expected = 1;
      blankRun = 0;
      inFootnoteBlock = false;
      continue;
    }
    if (line === '') {
      blankRun += 1;
      continue;
    }
    const m = line.match(NUM_RE);
    if (m && book > 0) {
      const num = Number(m[1]);
      const rest = m[2] ?? '';
      const isReal = num === expected && blankRun >= 1;
      if (isReal) {
        flush();
        curBook = book;
        curSection = num;
        buf = rest ? [rest] : [];
        expected = num + 1;
        inFootnoteBlock = false;
      } else {
        // Fußnote (oder Fortsetzung eines Fußnotenblocks): der aktuelle
        // Abschnitt bleibt offen, buf bleibt unverändert.
        inFootnoteBlock = true;
      }
      blankRun = 0;
      continue;
    }
    const hadBlankBefore = blankRun >= 1;
    blankRun = 0;
    if (book === 0) continue;
    if (inFootnoteBlock) {
      if (hadBlankBefore) {
        // Leerzeile(n) vor dieser Zeile beenden den Fußnotenblock (Fußnoten
        // selbst folgen ohne Leerzeile aufeinander) — der Fließtext des
        // unterbrochenen Abschnitts geht hier weiter.
        inFootnoteBlock = false;
        if (curSection > 0) buf.push(line);
      }
      // sonst: Fortsetzungszeile einer Fußnote -> verwerfen
      continue;
    }
    if (curSection > 0) buf.push(line);
  }
  flush();
  return out;
}
