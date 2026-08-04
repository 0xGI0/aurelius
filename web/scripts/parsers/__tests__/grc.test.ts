import { parseGrc } from '../grc';

// Diese Fixtures dokumentieren das REALE Format der PerseusDL-Edition
// (data/tlg0562/tlg001/tlg0562.tlg001.perseus-grc2.xml,
// https://github.com/PerseusDL/canonical-greekLit). Die Brief-Annahme
// ("verschachtelte <div subtype="book"> mit inneren
// <div subtype="section"|"chapter">") trifft die Verschachtelungstiefe
// NICHT: real sind es DREI Ebenen, nicht zwei:
//
//   <div subtype="book" n="…">
//     <div subtype="chapter" n="…">        <- das ist die Zähleinheit, die
//                                              der Referenzzählung (DE/EN,
//                                              "Abschnitt") entspricht
//       <div subtype="section" n="…">        <- feinere, rein redaktionelle
//         <p>…</p>                              Untergliederung (oft nur 1,
//       </div>                                  manchmal mehrere pro Kapitel);
//     </div>                                    wird zu EINEM Abschnittstext
//   </div>                                      zusammengefasst.
//
// D.h. der Parser muss "chapter" (nicht "section") als Zähleinheit für das
// Ausgabefeld `section` verwenden und dabei ALLE p-Texte der darin
// verschachtelten section-Divs zusammenfassen.
//
// Kapitelnummern werden UNVERÄNDERT aus dem n-Attribut übernommen, nicht
// neu durchnummeriert: die reale Datei hat in Buch 12 eine editorisch
// bedingte Lücke (Kapitel 17 -> 19, kein 18 — siehe unten), das Testfixture
// bildet eine analoge Lücke nach, damit sichergestellt ist, dass die Lücke
// erhalten bleibt statt weggezählt zu werden.
//
// Kritischer Apparat: <del>…</del> markiert vom Herausgeber getilgten Text
// (z. B. Dittographien oder eine irrtümlich in den Fließtext geratene
// Kapitelziffer wie "ιη′" [= 18] mitten in Kapitel 12.17 der echten Datei)
// — das gehört NICHT in den Lesetext und wird komplett samt Inhalt entfernt.
// <add>…</add> markiert dagegen eine editorische Ergänzung, die zum
// etablierten Lesetext gehört (fehlende Wörter, vom Herausgeber ergänzt) —
// hier wird nur das Tag entfernt, der Inhalt bleibt erhalten. Das
// unterscheidet sich von der naiven Brief-Implementierung, die <del> und
// <add> gleich (generisch, Tag weg/Inhalt bleibt) behandelt hätte.

const FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
 <text><body>
  <div type="textpart" subtype="book" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2" n="1">
   <div type="textpart" subtype="chapter" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:1" n="1">
    <div type="textpart" subtype="section" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:1.1" n="1">
     <p rend="indent">Παρὰ τοῦ πάππου Οὐήρου τὸ καλόηθες καὶ ἀόργητον. </p> </div> </div>
   <div type="textpart" subtype="chapter" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:1" n="2">
    <div type="textpart" subtype="section" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:1.2" n="1">
     <p rend="indent">Παρὰ τῆς δόξης καὶ μνήμης τῆς περὶ τοῦ γεννήσαντος
     τὸ αἰδῆμον καὶ ἀρρενικόν. </p> </div> </div>
   <div type="textpart" subtype="chapter" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:1" n="7">
    <div type="textpart" subtype="section" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:1.7" n="1">
     <p>Πρῶτον τμῆμα.</p> </div>
    <div type="textpart" subtype="section" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:1.7" n="2">
     <p>Δεύτερον τμῆμα.</p> </div> </div>
  </div>
  <div type="textpart" subtype="book" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2" n="2">
   <div type="textpart" subtype="chapter" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:2" n="17">
    <div type="textpart" subtype="section" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:2.17" n="1">
     <p>Ἕωθεν προλέγειν ἑαυτῷ <del>ιη′</del> εἰς τὸ πᾶν ἀεὶ ὁρᾶν, <add>τί ἐστιν</add> τὸ γινόμενον.</p> </div> </div>
   <div type="textpart" subtype="chapter" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:2" n="19">
    <div type="textpart" subtype="section" xml:base="urn:cts:greekLit:tlg0562.tlg001.perseus-grc2:2.19" n="1">
     <p>Τρίτον κεφάλαιον μετὰ τὸ κενόν.</p> </div> </div>
  </div>
 </body></text>
</TEI>`;

describe('parseGrc', () => {
  it('liest Buch/Kapitel (= Referenz-"Abschnitt") aus den DREI Div-Ebenen, fasst section-Divs pro Kapitel zusammen und normalisiert Whitespace', () => {
    const result = parseGrc(FIXTURE);
    expect(result).toEqual([
      { book: 1, section: 1, text: 'Παρὰ τοῦ πάππου Οὐήρου τὸ καλόηθες καὶ ἀόργητον.' },
      { book: 1, section: 2, text: 'Παρὰ τῆς δόξης καὶ μνήμης τῆς περὶ τοῦ γεννήσαντος τὸ αἰδῆμον καὶ ἀρρενικόν.' },
      { book: 1, section: 7, text: 'Πρῶτον τμῆμα. Δεύτερον τμῆμα.' },
      { book: 2, section: 17, text: 'Ἕωθεν προλέγειν ἑαυτῷ εἰς τὸ πᾶν ἀεὶ ὁρᾶν, τί ἐστιν τὸ γινόμενον.' },
      { book: 2, section: 19, text: 'Τρίτον κεφάλαιον μετὰ τὸ κενόν.' },
    ]);
  });

  it('nummeriert Kapitel unverändert nach dem n-Attribut (Lücke 17 -> 19 bleibt erhalten, wird nicht auf 17/18 durchgezählt)', () => {
    const result = parseGrc(FIXTURE);
    const book2Sections = result.filter((s) => s.book === 2).map((s) => s.section);
    expect(book2Sections).toEqual([17, 19]);
  });

  it('entfernt <del>-Inhalt (getilgter Text, z. B. eine irrtümliche Kapitelziffer im Fließtext) komplett, behält aber <add>-Inhalt (editorische Ergänzung) als reinen Text', () => {
    const result = parseGrc(FIXTURE);
    const text = result.find((s) => s.book === 2 && s.section === 17)!.text;
    expect(text).not.toContain('ιη′');
    expect(text).toContain('τί ἐστιν τὸ γινόμενον');
  });
});
