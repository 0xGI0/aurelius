import { parseEn } from '../en';

// Diese Fixtures dokumentieren das REALE Format von Project Gutenberg #2680
// ("Meditations" von Marcus Aurelius, https://www.gutenberg.org/cache/epub/2680/pg2680.txt).
//
// Die ursprüngliche Brief-Annahme (Buchüberschriften "THE FIRST BOOK" ...
// "THE TWELFTH BOOK", Abschnitte als "I. Text" am Zeilenanfang, Rahmen
// "*** START OF ... ***" / "*** END OF ... ***") trifft für Buchüberschriften
// und Abschnittsnummerierung tatsächlich zu — hier musste NICHTS angepasst
// werden. Die reale Datei enthält aber zusätzliches Beiwerk, das die
// ursprüngliche einfache Annahme nicht behandelt hätte:
//
//   - Zeilenenden sind CRLF (\r\n), nicht \n. `trim()` entfernt \r
//     automatisch (wie im DE-Parser), keine zusätzliche Logik nötig, aber
//     hier explizit mit einem CRLF-Fixture abgesichert.
//   - Zwischen "*** START ***" und der ersten echten Buchüberschrift steht
//     viel Beiwerk (Inhaltsverzeichnis, Einleitung, eine Widmung "HIS FIRST
//     BOOK"). Das ist unproblematisch, weil keine dieser Zeilen exakt auf
//     "THE (\w+) BOOK" passt ("FIRST BOOK" ohne "THE", "HIS FIRST BOOK" mit
//     "HIS" statt "THE") — der Parser bleibt bis zur ersten echten
//     Buchüberschrift im book===0-Zustand und verwirft alles.
//   - NACH "THE TWELFTH BOOK" folgt vor dem "*** END ***"-Marker ein
//     "APPENDIX" (Briefwechsel mit Fronto), gefolgt von "NOTES" und
//     "GLOSSARY". Der Appendix-Text enthält selbst römisch nummerierte
//     Zeilen (Briefnummern, Fußnotenverweise), die ohne explizites
//     Abschneiden fälschlich als Fortsetzung von Buch XII geparst würden.
//     Reale Stichprobe: ungefiltert würden nach Buch XII, Abschnitt XXVII
//     (dem letzten echten Abschnitt) noch etliche zusätzliche
//     "Abschnitte" mit unsortierten Nummern (X, XI, XVI, XXIII, ...) aus
//     dem Appendix angehängt. Der Parser schneidet daher explizit an der
//     "APPENDIX"-Zeile nach "THE TWELFTH BOOK" ab.
//   - Am Ende von Buch II (nach dem letzten Abschnitt XV, vor "THE THIRD
//     BOOK") steht eine alleinstehende, komplett kursivierte Kolophon-Zeile
//     "_Whilst I was at Carnuntum._" (Orts-/Datumsangabe im Gutenberg-
//     Rohtext per Unterstrich-Kursivierung markiert). Das ist kein
//     Abschnittstext und darf nicht an den vorherigen Abschnitt angehängt
//     werden. Erkennungsregel: eine Zeile, die komplett in "_..._"
//     eingeschlossen ist, wird verworfen.
//   - Einzelne Wörter/Phrasen MITTEN im Fließtext sind ebenfalls per
//     Unterstrich kursiviert (z. B. "_Hypomnemata_", "_in infinitum_").
//     Diese Unterstriche sind reine Kursiv-Markup-Artefakte des
//     Gutenberg-Texts (keine echte Interpunktion) und werden aus dem
//     Ergebnistext entfernt.
//   - Fußnoten in eckigen Klammern (z. B. "[1]", "[Footnote ...]") wie im
//     DE-Parser (dort: fortlaufende Fußnotenziffern im "N   Text"-Format)
//     kommen im Fließtext der 12 Bücher NICHT vor: eine Durchsuchung des
//     gesamten Bereichs zwischen der ersten Buchüberschrift und "APPENDIX"
//     auf das Zeichen "[" ergab keinen einzigen Treffer. Eckige Klammern
//     tauchen nur im APPENDIX/NOTES-Beiwerk auf (z. B. "FRONTO[1]" in der
//     Appendix-Überschrift), das ohnehin abgeschnitten wird. Es gibt daher
//     keine Fußnoten-Erkennung/-Entfernung im Fließtext zu implementieren.
//   - Manche Bücher haben in dieser Ausgabe (laut eingebettetem NOTES-
//     Abschnitt eine auf Casaubons Übersetzung basierende Zählung, nicht
//     Longs, obwohl der Task-Titel "Long" nennt — siehe Task-Report)
//     Lücken in der fortlaufenden Nummerierung, z. B. Buch II springt von
//     "IV." direkt zu "VI." (kein Abschnitt V). Das ist eine echte
//     Eigenheit der Quelle, keine Fußnote — der Parser übernimmt die
//     römischen Zahlen wörtlich, ohne eine "erwartete nächste Nummer"
//     durchzusetzen (anders als der DE-Parser, der das zur
//     Fußnoten-Disambiguierung braucht).

const FIXTURE = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
Introduction text to be discarded.

THE FIRST BOOK

I. Of my grandfather Verus I have learned to be
gentle and meek.

II. Of him that brought me up, not to be fondly
addicted to either of the two great factions.

THE SECOND BOOK

I. Remember how long thou hast already put off these things.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;

describe('parseEn', () => {
  it('erkennt Bücher, römische Abschnittsnummern und schneidet Gutenberg-Rahmen ab', () => {
    const result = parseEn(FIXTURE);
    expect(result).toEqual([
      { book: 1, section: 1, text: 'Of my grandfather Verus I have learned to be gentle and meek.' },
      { book: 1, section: 2, text: 'Of him that brought me up, not to be fondly addicted to either of the two great factions.' },
      { book: 2, section: 1, text: 'Remember how long thou hast already put off these things.' },
    ]);
  });

  it('funktioniert mit CRLF-Zeilenenden (reales Gutenberg-Format)', () => {
    const fixture = FIXTURE.replace(/\n/g, '\r\n');
    expect(parseEn(fixture)).toEqual([
      { book: 1, section: 1, text: 'Of my grandfather Verus I have learned to be gentle and meek.' },
      { book: 1, section: 2, text: 'Of him that brought me up, not to be fondly addicted to either of the two great factions.' },
      { book: 2, section: 1, text: 'Remember how long thou hast already put off these things.' },
    ]);
  });

  it('verwirft Inhaltsverzeichnis- und Widmungs-Beiwerk vor der ersten echten Buchüberschrift', () => {
    // Reale Struktur: TOC listet "     FIRST BOOK" (ohne "THE", eingerückt),
    // danach folgt eine Widmung mit Überschrift "HIS FIRST BOOK" (mit "HIS"
    // statt "THE") und einem eigenen Zitat "ANTONINUS Book vi. Num. xlviii.
    // ...". Keine dieser Zeilen darf als Buchanfang erkannt werden.
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

CONTENTS

     FIRST BOOK

     SECOND BOOK

INTRODUCTION

Some biographical text that must be discarded, mentioning I. things
and II. more things without being inside a book.

HIS FIRST BOOK

concerning HIMSELF:

ANTONINUS Book vi. Num. xlviii. Whensoever thou wilt rejoice thyself,
think and meditate.

THE FIRST BOOK

I. Real first section.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([{ book: 1, section: 1, text: 'Real first section.' }]);
  });

  it('schneidet den Appendix nach Buch XII ab, statt ihn als Fortsetzung von Buch XII zu parsen', () => {
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

THE TWELFTH BOOK

I. Last book, first section.

XXVII. Last real section of the last book.

APPENDIX

CORRESPONDENCE OF M. AURELIUS ANTONINUS AND M. CORNELIUS FRONTO

I. This looks like a section but is Appendix letter numbering.

II. So does this.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 12, section: 1, text: 'Last book, first section.' },
      { book: 12, section: 27, text: 'Last real section of the last book.' },
    ]);
  });

  it('verwirft eine alleinstehende kursivierte Kolophon-Zeile ("_Whilst I was at Carnuntum._"), statt sie an den vorigen Abschnitt anzuhängen', () => {
    // Realer Fall am Ende von Buch II: nach dem letzten Abschnitt (vor "THE
    // THIRD BOOK") steht diese Orts-/Datumsangabe als eigene Zeile.
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

THE SECOND BOOK

I. Last section of book two.

_Whilst I was at Carnuntum._

THE THIRD BOOK

I. First section of book three.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 2, section: 1, text: 'Last section of book two.' },
      { book: 3, section: 1, text: 'First section of book three.' },
    ]);
  });

  it('entfernt Kursiv-Unterstriche mitten im Fließtext, behält aber den Wortinhalt', () => {
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

THE FIRST BOOK

I. Whom also I must thank for the _Hypomnemata_, and so upwards _in infinitum_.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 1, section: 1, text: 'Whom also I must thank for the Hypomnemata, and so upwards in infinitum.' },
    ]);
  });

  it('übernimmt Lücken in der Original-Nummerierung wörtlich (kein erzwungenes +1)', () => {
    // Reale Eigenheit von Buch II in dieser Ausgabe: kein Abschnitt V.
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

THE SECOND BOOK

IV. Section four.

VI. Section six, there is no section five in this edition.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 2, section: 4, text: 'Section four.' },
      { book: 2, section: 6, text: 'Section six, there is no section five in this edition.' },
    ]);
  });
});
