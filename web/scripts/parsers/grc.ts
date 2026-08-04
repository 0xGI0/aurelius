// Parser für den griechischen Originaltext (Τὰ εἰς ἑαυτόν), PerseusDL
// Canonical Greek Literature, Werk tlg0562.tlg001, Edition
// tlg0562.tlg001.perseus-grc2.xml
// (https://github.com/PerseusDL/canonical-greekLit/blob/master/data/tlg0562/tlg001/tlg0562.tlg001.perseus-grc2.xml).
//
// HINWEIS: Die Brief-Annahme ("verschachtelte <div subtype="book"> mit
// inneren <div subtype="section"|"chapter">", also ZWEI Ebenen mit
// alternativem Namen für die innere Ebene) trifft die reale Struktur nicht.
// Real sind es DREI Div-Ebenen, immer mit denselben drei subtype-Namen:
//
//   <div type="textpart" subtype="book" n="…">
//     <div type="textpart" subtype="chapter" n="…">
//       <div type="textpart" subtype="section" n="…"><p>…</p></div>
//       [ggf. weitere section-Divs mit fortlaufendem section-n]
//     </div>
//   </div>
//
// "chapter" ist die Zähleinheit, die der Referenzzählung aus DE (Wittstock)
// und EN (Long) entspricht ("Abschnitt" 1..17 in Buch I usw.) — nicht
// "section". Die inneren section-Divs sind eine rein redaktionelle
// Feingliederung innerhalb eines Kapitels (meist genau eine, gelegentlich
// mehrere pro Kapitel) und werden zu EINEM Abschnittstext zusammengefasst.
//
// Kapitelnummern werden unverändert aus dem n-Attribut übernommen, NICHT
// neu durchgezählt. Buch 12 hat dadurch real eine Lücke: Kapitel 17 -> 19,
// kein 18. Grund: im Fließtext von Kapitel 12.17 steht mitten im Satz die
// getilgte Ziffer "<del>ιη′</del>" (= griechische Zahl 18) — ein
// Abschreibfehler, bei dem die Kapitelmarke versehentlich in den
// Fließtext geraten ist, statt einen eigenen Kapitelanfang zu markieren.
// Es gibt daher schlicht kein eigenständiges Kapitel 12.18 im Text. Das ist
// eine seit der Editio princeps (Xylander) tradierte Zähl-Eigenheit der
// Selbstbetrachtungen, keine Bug im XML. Buch 12 hat entsprechend nur 35
// statt 36 Kapitel (Details siehe Task-Report); alle anderen 11 Bücher
// treffen die DE/EN-Referenzzählung exakt.
//
// Kritischer Apparat:
//  - <del>…</del>: vom Herausgeber getilgter Text (Dittographien, s.o. die
//    irrtümliche Kapitelziffer, überzählige Wörter) — gehört nicht in den
//    Lesetext, wird KOMPLETT samt Inhalt entfernt.
//  - <add>…</add>: editorische Ergänzung, die zum etablierten Lesetext
//    gehört (vom Herausgeber sinngemäß ergänzte, im Original fehlende
//    Wörter) — nur das Tag wird entfernt, der Inhalt bleibt erhalten.
//    (Das ist der Punkt, an dem die naive Brief-Implementierung, die <del>
//    und <add> beide nur generisch behandelt hätte, den Lesetext verfälscht
//    hätte, siehe Fixture-Testfall.)
//  - <note>: kommt in dieser Edition nicht vor, wird defensiv trotzdem wie
//    <del> komplett entfernt (Kommentar/Marginalie, kein Lesetext).
//  - <quote>, <lb/>, <milestone/> u. ä.: echte, zum Lesetext gehörende
//    Inline-Zitate (Marc Aurel zitiert gelegentlich Homer, Euripides,
//    Empedokles) bzw. reine Formatierungsmarken — werden generisch wie alle
//    übrigen Tags nur als Tag entfernt, Inhalt bleibt erhalten.
//
// Named-Entities kommen in dieser Datei nicht vor (UTF-8 direkt, keine
// &…;-Escapes für griechische Zeichen); &amp;/&lt;/&gt; werden trotzdem
// defensiv aufgelöst.

export interface ParsedSection {
  book: number;
  section: number;
  text: string;
}

function stripTags(s: string): string {
  return s
    .replace(/<note[\s\S]*?<\/note>/g, ' ')
    .replace(/<del[\s\S]*?<\/del>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseGrc(xml: string): ParsedSection[] {
  const out: ParsedSection[] = [];
  const bookRe =
    /<div[^>]*subtype="book"[^>]*\sn="(\d+)"[^>]*>([\s\S]*?)(?=<div[^>]*subtype="book"|<\/body>)/g;
  let bm: RegExpExecArray | null;
  while ((bm = bookRe.exec(xml)) !== null) {
    const book = Number(bm[1]);
    const bookBody = bm[2];
    const chapterRe =
      /<div[^>]*subtype="chapter"[^>]*\sn="(\d+)"[^>]*>([\s\S]*?)(?=<div[^>]*subtype="chapter"|$)/g;
    let cm: RegExpExecArray | null;
    while ((cm = chapterRe.exec(bookBody)) !== null) {
      const text = stripTags(cm[2]);
      if (text.length > 0) out.push({ book, section: Number(cm[1]), text });
    }
  }
  return out;
}
