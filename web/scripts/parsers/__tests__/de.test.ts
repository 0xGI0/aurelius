import { parseDe } from '../de';

// Diese Fixtures dokumentieren das REALE pdftotext-Output-Format der
// Wittstock-Reclam-PDF (per `pdftotext -layout -enc UTF-8`), das von der
// ursprünglichen Brief-Annahme abweicht:
//   - Abschnittsnummern haben KEINEN Punkt ("1      Text", nicht "1. Text").
//   - Seitenfußnoten beginnen mit demselben "N   Text"-Muster wie Abschnitte
//     und müssen anhand von Leerzeilen-Abständen/Nummernfolge unterschieden
//     und verworfen werden (auch wenn eine Fußnotennummer zufällig mit der
//     erwarteten nächsten Abschnittsnummer übereinstimmt).
//   - Silbentrennung am Zeilenende ("getrenn-\nte") muss zusammengefügt werden.
//   - Der eingebettete Font bildet die historischen Ligaturen "ft", "tt",
//     "fft", "fh" nicht auf echte Buchstaben ab, sondern auf Steuerzeichen
//     (U+0001, U+0002, U+0005, U+0007), die repariert werden müssen.
//   - Fußnotenverweise im Fließtext hängen ohne Leerzeichen direkt an einem
//     Wort ("Erzieher5") und müssen entfernt werden.
//   - Kopfzeilen können ein Form-Feed-Zeichen (U+000C) vor "Marc Aurel ..."
//     enthalten (Seitenumbruch), Seitenzahlen stehen als "| N |".

const FT = '';
const TT = '';
const FF = '';

describe('parseDe', () => {
  it('verwirft Einleitung, erkennt Bücher und Abschnitte (ohne Punkt), entfernt Kopf-/Fußzeilen', () => {
    const fixture = `Marc Aurel – Selbstbetrachtungen                    Einleitung
Einleitung
Dies ist Vorgeplänkel und muss verworfen werden.
                                   | 4 |
        Erstes Buch

1      Vom Großvater lernte ich Milde und Gelassenheit.

2      Vom Vater lernte ich Bescheidenheit und Mannhaftigkeit.

                                   | 9 |
${FF}Marc Aurel – Selbstbetrachtungen                    Erstes Buch

        Zweites Buch

1       Am Morgen sage dir: Heute werde ich einem lästigen Menschen begegnen.
`;
    expect(parseDe(fixture)).toEqual([
      { book: 1, section: 1, text: 'Vom Großvater lernte ich Milde und Gelassenheit.' },
      { book: 1, section: 2, text: 'Vom Vater lernte ich Bescheidenheit und Mannhaftigkeit.' },
      { book: 2, section: 1, text: 'Am Morgen sage dir: Heute werde ich einem lästigen Menschen begegnen.' },
    ]);
  });

  it('fügt bei Silbentrennung am Zeilenende getrennte Wörter wieder zusammen', () => {
    const fixture = `Erstes Buch

1      Dies ist ein Satz mit einem getrenn-
       ten Wort am Zeilenende.
`;
    expect(parseDe(fixture)).toEqual([
      { book: 1, section: 1, text: 'Dies ist ein Satz mit einem getrennten Wort am Zeilenende.' },
    ]);
  });

  it('repariert Ligatur-Steuerzeichen (ft/tt) aus dem pdftotext-Export', () => {
    const fixture = `Erstes Buch

1      Das erforderte Kra${FT} und Gö${TT}lichkeit zugleich.
`;
    expect(parseDe(fixture)).toEqual([
      { book: 1, section: 1, text: 'Das erforderte Kraft und Göttlichkeit zugleich.' },
    ]);
  });

  it('entfernt Fußnotenverweise, die ohne Leerzeichen an ein Wort angehängt sind', () => {
    const fixture = `Erstes Buch

1      Vom Erzieher5 lernte ich Geduld.
`;
    expect(parseDe(fixture)).toEqual([
      { book: 1, section: 1, text: 'Vom Erzieher lernte ich Geduld.' },
    ]);
  });

  it('überspringt Seitenfußnoten, auch wenn deren Nummer zufällig der erwarteten Abschnittsnummer entspricht', () => {
    const fixture = `Erstes Buch

1      Erster Abschnitt.

2      Zweiter Abschnitt.

1   Fußnote eins.
2   Fußnote zwei.
3   Fußnote drei, die zufällig dieselbe Nummer wie der nächste Abschnitt trägt.

3      Dritter Abschnitt, der wirklich zu Buch eins gehört.
`;
    expect(parseDe(fixture)).toEqual([
      { book: 1, section: 1, text: 'Erster Abschnitt.' },
      { book: 1, section: 2, text: 'Zweiter Abschnitt.' },
      { book: 1, section: 3, text: 'Dritter Abschnitt, der wirklich zu Buch eins gehört.' },
    ]);
  });

  it('setzt den Fließtext eines Abschnitts nach einem Fußnotenblock über einen Seitenumbruch hinweg fort (statt ihn abzuschneiden)', () => {
    // Realer Fall aus Buch XII, Abschnitt 36: Am Seitenende folgt eine
    // mehrzeilige Fußnote, danach Seitenzahl + Kopfzeile (Seitenumbruch),
    // und erst danach geht der Satz des Abschnitts weiter. Der Abschnitt
    // darf hier NICHT vorzeitig abgeschlossen werden.
    const fixture = `Erstes Buch

1      Dies ist der Anfang des Satzes, der von einer Fußnote

12   Dies ist eine mehrzeilige Fußnote, die
     über zwei Zeilen geht und verworfen werden muss.

                                   | 9 |
${FF}Marc Aurel – Selbstbetrachtungen                    Erstes Buch

unterbrochen wird und danach weitergeht.
`;
    expect(parseDe(fixture)).toEqual([
      {
        book: 1,
        section: 1,
        text: 'Dies ist der Anfang des Satzes, der von einer Fußnote unterbrochen wird und danach weitergeht.',
      },
    ]);
  });

  it('zerlegt Unicode-Ligatur-Glyphen (ﬀ, ﬁ, ﬂ) in normale Buchstabenfolgen', () => {
    const fixture = `Erstes Buch

1      Der Stoﬀ und die Ho\u{FB00}nung ﬂießen ineinander.
`;
    expect(parseDe(fixture)).toEqual([
      { book: 1, section: 1, text: 'Der Stoff und die Hoffnung fließen ineinander.' },
    ]);
  });
});
