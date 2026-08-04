// Parser für den englischen Marc-Aurel-Text, George Longs Übersetzung
// (Project Gutenberg #15877, "Thoughts of Marcus Aurelius Antoninus",
// https://www.gutenberg.org/cache/epub/15877/pg15877.txt).
//
// HINWEIS: Ursprünglich wurde PG #2680 verwendet (Format-Annahme aus dem
// Task-Brief traf dort exakt zu), das ist aber laut eigenem NOTES-Abschnitt
// tatsächlich Casaubons Übersetzung, nicht Longs, wie von der Spec
// verbindlich gefordert. #15877 ist verifiziert Longs Übersetzung
// (Header: "Translator: George Long"; Buch I §1 "From my grandfather Verus
// I learned good morals..." ist Longs bekannter Wortlaut). Longs Zählung
// trifft die deutsche Referenzzählung (Wittstock, 487 Abschnitte) exakt pro
// Buch — ein starkes Signal, dass dies die richtige Quelle ist.
//
// Reales Format (komplett anders als bei PG #2680/Casaubon):
//  - Buchüberschriften sind eine alleinstehende römische Zahl mit Punkt,
//    sonst nichts auf der Zeile: "I." … "XII.".
//  - Der ERSTE Abschnitt eines Buches hat KEINE Nummer (beginnt direkt nach
//    der Buchüberschrift). Alle weiteren Abschnitte sind mit arabischen
//    Zahlen nummeriert: "2. Text", "3. Text", ...
//  - Nach Buch XII folgt vor dem Gutenberg-Ende-Marker "INDEXES." (Index of
//    Terms, General Index) — muss abgeschnitten werden, sonst würde der
//    Glossar-Text (selbst voller "[Wort]"-Klammern) als Fortsetzung von
//    Buch XII geparst.
//  - Fußnoten sind mit genau 4 Leerzeichen eingerückt und beginnen mit
//    einer Referenz "[A]".."[E]" (Groß-Buchstabe(n) in Klammern). Mehrzeilige
//    Fußnoten und mehrere Fußnoten hintereinander bleiben bis zur nächsten
//    NICHT eingerückten Zeile eingerückt (auch wenn eine verschachtelte
//    Zitatzeile innerhalb der Fußnote eine andere Einrückungstiefe hat, z. B.
//    9 statt 4 Leerzeichen). Erkennung daher zustandsbasiert: einmal in
//    einer Fußnote, bleiben ALLE eingerückten Zeilen (unabhängig von der
//    genauen Einrückungstiefe) verworfen, bis wieder eine nicht-eingerückte
//    Zeile erscheint.
//  - WICHTIGER UNTERSCHIED zu Fußnoten: Marcus/Long zitiert gelegentlich
//    Verse (Homer, Hesiod, Empedokles) mitten im Fließtext, ebenfalls
//    eingerückt, aber NICHT mit "[X]"-Referenz eingeleitet und NICHT durch
//    eine vorherige Fußnote ausgelöst — diese Verszeilen gehören zum
//    eigentlichen Abschnittstext und müssen erhalten bleiben (nur die
//    Einrückung selbst wird beim Trimmen entfernt).
//  - Inline-Klammern kommen in drei verschiedenen Bedeutungen vor:
//     1. Fußnoten-Referenzen "[A]".."[E]" direkt an ein Wort angehängt →
//        vollständig entfernen.
//     2. Griechische Transliterationen "[Greek: ...]" (auch doppelt
//        geklammert "[[Greek: ...]]") — Ersatz für griechische
//        Schriftzeichen, die die reine ASCII-Transkription nicht abbilden
//        kann. Für den Lesetext ohne Mehrwert → vollständig entfernen.
//     3. Echte redaktionelle Ergänzungen Longs, um die im Griechischen
//        implizite Satzaussage zu vervollständigen, z. B. "[I learned]",
//        "[only]", "[the same]" → NUR die Klammern entfernen, der
//        Wortinhalt bleibt (sonst fehlten reihenweise Verben/Objekte).
//  - Vereinzelt steht mitten im Fließtext ein alleinstehendes "+" (matcht zu
//    keiner Fußnotendefinition — vermutlich ein bei der ASCII-Transkription
//    verlorenes typographisches Kritik-/Konjektur-Zeichen, im Original wohl
//    ein Kreuz/Obelus für unsichere Lesarten). Wird als Artefakt entfernt.
//  - "[Illustration: ...]" markiert eine Bildunterschrift (Kupferstich)
//    zwischen zwei Abschnitten — komplett verwerfen, gehört zu keinem
//    Abschnitt.
//  - Kursiv-Unterstriche ("_word_") wie schon bei PG #2680 beobachtet;
//    werden aus dem Ergebnistext entfernt.

const SECTION_RE = /^(\d+)\.\s+(.*)$/;
const BOOK_RE = /^([IVXLC]+)\.$/;
const ILLUSTRATION_RE = /^\[Illustration:.*\]$/;
const FOOTNOTE_START_RE = /^\[[A-Z]{1,2}\]/;
const GREEK_BRACKET_RE = /\[+Greek:[^\]]*\]+/g;
const FOOTNOTE_LETTER_RE = /\[[A-Z]{1,2}\]/g;
const EDITORIAL_BRACKET_RE = /\[([^[\]]*)\]/g;

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

  // Index of Terms / General Index nach Buch XII abschneiden.
  const twelfthIdx = body.search(/\n\s*XII\.\s*\r?\n/);
  const indexIdx = twelfthIdx >= 0 ? body.indexOf('\nINDEXES', twelfthIdx) : -1;
  if (indexIdx >= 0) body = body.slice(0, indexIdx);

  const out: ParsedSection[] = [];
  let book = 0;
  let section = 0;
  let buf: string[] = [];
  let inFootnote = false;

  const flush = () => {
    if (book > 0 && section > 0 && buf.length > 0) {
      let text = buf.join(' ');
      text = text.replace(GREEK_BRACKET_RE, '');
      text = text.replace(FOOTNOTE_LETTER_RE, '');
      text = text.replace(/\+/g, ' ');
      text = text.replace(EDITORIAL_BRACKET_RE, '$1');
      text = text.replace(/_/g, '');
      text = text.replace(/\s+/g, ' ').trim();
      out.push({ book, section, text });
    }
    buf = [];
  };

  for (const rawLine of body.split('\n')) {
    const indented = /^[ \t]/.test(rawLine);
    const line = rawLine.trim();

    if (line === '') continue;

    if (indented) {
      if (!inFootnote && FOOTNOTE_START_RE.test(line)) inFootnote = true;
      if (inFootnote) continue;
      // sonst: echte eingerückte Verszitat-Zeile im Fließtext -> unten wie
      // gewöhnliche Zeile weiterverarbeiten
    } else {
      inFootnote = false;
    }

    const bookMatch = line.match(BOOK_RE);
    if (bookMatch) {
      flush();
      book = romanToInt(bookMatch[1]);
      section = 0;
      continue;
    }
    if (book === 0) continue;
    if (ILLUSTRATION_RE.test(line)) continue;

    const m = line.match(SECTION_RE);
    if (m) {
      flush();
      section = Number(m[1]);
      buf = [m[2]];
    } else if (section === 0) {
      // erster (unnummerierter) Abschnitt eines Buches
      section = 1;
      buf = [line];
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}
