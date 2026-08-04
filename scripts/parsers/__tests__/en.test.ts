import { parseEn } from '../en';

// Diese Fixtures dokumentieren das REALE Format von Project Gutenberg #15877
// ("Thoughts of Marcus Aurelius Antoninus", übersetzt von George Long,
// https://www.gutenberg.org/cache/epub/15877/pg15877.txt). Die Spec
// verlangt verbindlich Longs Übersetzung; die ursprünglich verwendete Datei
// PG #2680 war fälschlich Casaubons Übersetzung (siehe Task-Report).
//
// Longs Format weicht von der ursprünglichen Brief-Annahme deutlich ab:
//   - Buchüberschriften sind eine ALLEINSTEHENDE römische Zahl, sonst
//     nichts auf der Zeile: "I." … "XII." (nicht "THE FIRST BOOK").
//   - Der ERSTE Abschnitt eines Buches hat KEINE Nummer, beginnt direkt
//     nach der Buchüberschrift. Alle weiteren Abschnitte sind mit
//     ARABISCHEN Zahlen nummeriert ("2. Text", "3. Text", ... nicht
//     römisch).
//   - Nach Buch XII folgt vor dem Gutenberg-Ende-Marker "INDEXES." (Index
//     of Terms, General Index) — wird abgeschnitten, sonst würde der
//     Glossar-Text (selbst voller "[Wort]"-Klammern) als Fortsetzung von
//     Buch XII geparst.
//   - Fußnoten sind mit genau 4 Leerzeichen eingerückt und beginnen mit
//     einer Referenz "[A]".."[E]". Solange eine Zeile eingerückt ist,
//     bleibt der Parser "in der Fußnote" (auch bei abweichender
//     Einrückungstiefe verschachtelter Zitate) und verwirft, bis wieder
//     eine NICHT eingerückte Zeile erscheint.
//   - Marcus/Long zitiert gelegentlich Verse (Homer, Hesiod, Empedokles)
//     mitten im Fließtext, ebenfalls eingerückt, aber OHNE "[X]"-Referenz
//     am Anfang — diese Verszeilen gehören zum Abschnittstext und bleiben
//     erhalten (nur die Einrückung wird beim Trimmen entfernt).
//   - Eckige Klammern haben drei Bedeutungen: (1) Fußnoten-Referenzen
//     "[A]" -> vollständig entfernen; (2) griechische Transliterationen
//     "[Greek: ...]" (auch doppelt geklammert) -> vollständig entfernen;
//     (3) echte redaktionelle Ergänzungen Longs wie "[I learned]" -> nur
//     die Klammern entfernen, Wortinhalt bleibt.
//   - Vereinzelte alleinstehende "+"-Zeichen im Fließtext (vermutlich ein
//     bei der ASCII-Transkription verlorenes Konjektur-/Kritikzeichen,
//     keiner Fußnotendefinition zuordenbar) werden als Artefakt entfernt.
//   - "[Illustration: ...]" markiert eine Bildunterschrift zwischen zwei
//     Abschnitten — wird komplett verworfen.
//   - Kursiv-Unterstriche ("_word_") werden wie bei PG #2680 entfernt.

const FIXTURE = `*** START OF THE PROJECT GUTENBERG EBOOK THOUGHTS OF MARCUS AURELIUS ANTONINUS ***
Biographical sketch to be discarded.

I.

From my grandfather Verus I learned good morals and the government
of my temper.

2. From the reputation and remembrance of my father, modesty and a
manly character.

II.

Begin the morning by saying to thyself, I shall meet with the busybody.

*** END OF THE PROJECT GUTENBERG EBOOK THOUGHTS OF MARCUS AURELIUS ANTONINUS ***
`;

describe('parseEn', () => {
  it('erkennt Bücher (alleinstehende römische Zahl), einen unnummerierten ersten Abschnitt und arabisch nummerierte Folgeabschnitte, schneidet Gutenberg-Rahmen ab', () => {
    const result = parseEn(FIXTURE);
    expect(result).toEqual([
      { book: 1, section: 1, text: 'From my grandfather Verus I learned good morals and the government of my temper.' },
      { book: 1, section: 2, text: 'From the reputation and remembrance of my father, modesty and a manly character.' },
      { book: 2, section: 1, text: 'Begin the morning by saying to thyself, I shall meet with the busybody.' },
    ]);
  });

  it('funktioniert mit CRLF-Zeilenenden (reales Gutenberg-Format)', () => {
    const fixture = FIXTURE.replace(/\n/g, '\r\n');
    expect(parseEn(fixture)).toEqual([
      { book: 1, section: 1, text: 'From my grandfather Verus I learned good morals and the government of my temper.' },
      { book: 1, section: 2, text: 'From the reputation and remembrance of my father, modesty and a manly character.' },
      { book: 2, section: 1, text: 'Begin the morning by saying to thyself, I shall meet with the busybody.' },
    ]);
  });

  it('verwirft eine eingerückte Fußnote (Referenz "[A]"), auch mehrzeilig, bis zur nächsten nicht eingerückten Zeile', () => {
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

I.

From my grandfather Verus[A] I learned good morals.

    [A] Annius Verus was his grandfather's name. There is no verb
    in this section connected with the word "from."

2. Second real section, after the footnote block.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 1, section: 1, text: 'From my grandfather Verus I learned good morals.' },
      { book: 1, section: 2, text: 'Second real section, after the footnote block.' },
    ]);
  });

  it('behält eine eingerückte Verszeile im Fließtext, die NICHT durch eine Fußnoten-Referenz eingeleitet wird', () => {
    // Realer Fall Buch II §10 (Long-Übersetzung): eine zitierte Verszeile
    // ist eingerückt, aber keine Fußnote — sie gehört zum Abschnittstext.
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

I.

Consider if thou hast hitherto behaved to all in such a way that
this may be said of thee,--

      "Never has wronged a man in deed or word."

And call to recollection both how many things thou hast passed through.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      {
        book: 1,
        section: 1,
        text:
          'Consider if thou hast hitherto behaved to all in such a way that this may be said of thee,-- ' +
          '"Never has wronged a man in deed or word." And call to recollection both how many things thou hast passed through.',
      },
    ]);
  });

  it('schneidet "INDEXES." (Index of Terms / General Index) nach Buch XII ab, statt es als Fortsetzung von Buch XII zu parsen', () => {
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

XII.

Last book, first section.

2. Last real section of the last book.

INDEXES.

INDEX OF TERMS.

[Greek: adiaphora] (indifferentia, Cicero, Seneca); things
  indifferent, neither good nor bad.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 12, section: 1, text: 'Last book, first section.' },
      { book: 12, section: 2, text: 'Last real section of the last book.' },
    ]);
  });

  it('entfernt eine Bildunterschrift ("[Illustration: ...]") zwischen zwei Abschnitten', () => {
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

I.

First section text.

[Illustration: THE FORUM]

2. Second section text.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 1, section: 1, text: 'First section text.' },
      { book: 1, section: 2, text: 'Second section text.' },
    ]);
  });

  it('entfernt griechische Transliterationen ("[Greek: ...]", auch doppelt geklammert) vollständig, behält aber redaktionelle Ergänzungen wie "[I learned]" als reinen Text', () => {
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

I.

A member [Greek: melos] of the system, [I learned], and Extensions [[Greek: aktines]] too.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 1, section: 1, text: 'A member of the system, I learned, and Extensions too.' },
    ]);
  });

  it('entfernt vereinzelte alleinstehende "+"-Zeichen (Transkriptionsartefakt) aus dem Fließtext', () => {
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

I.

If then thou art irritable, + cure this man's disposition.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 1, section: 1, text: "If then thou art irritable, cure this man's disposition." },
    ]);
  });

  it('entfernt Kursiv-Unterstriche mitten im Fließtext, behält aber den Wortinhalt', () => {
    const fixture = `*** START OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***

I.

We know, from Tacitus, the _Life of Antoninus_ in full.

*** END OF THE PROJECT GUTENBERG EBOOK MEDITATIONS ***
`;
    expect(parseEn(fixture)).toEqual([
      { book: 1, section: 1, text: 'We know, from Tacitus, the Life of Antoninus in full.' },
    ]);
  });
});
