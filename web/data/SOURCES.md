# Quellen & Lizenzen

Alle Texte sind gemeinfrei (Urheber > 70 Jahre tot bzw. antiker Text).

| Sprache | Quelle | Nachweis |
|---|---|---|
| Deutsch | Albert Wittstock (Übers.), *Des Kaisers Marcus Aurelius Antoninus Selbstbetrachtungen*, Reclam UB 1241 (Erstausgabe 1879; verwendeter Nachdruck 1986). Wittstock (20.8.1837–16.1.1903) → gemeinfrei seit 1.1.1974 (§ 64/§ 69 UrhG, 70 Jahre p.m.a.). | PDF: `data-sources/Selbstbetrachtungen-Wittstock-Reclam.pdf` (von freismuth.org) |
| Englisch | George Long (Übers.), *The Thoughts of the Emperor M. Aurelius Antoninus* (1862). Long (4.11.1800–1879) → gemeinfrei. | Project Gutenberg **#15877**, `data-sources/pg-long.txt` (nicht #2680 — jene Ausgabe enthält tatsächlich Casaubons statt Longs Übersetzung, siehe Task-4-Report; wurde korrigiert) |
| Altgriechisch | Marcus Aurelius, *Τὰ εἰς ἑαυτόν*; Edition aus PerseusDL canonical-greekLit (tlg0562.tlg001, Datei `tlg0562.tlg001.perseus-grc2.xml`). | Committet als `data-sources/tlg0562.tlg001.xml` (heruntergeladen vom master-Branch von PerseusDL/canonical-greekLit). Lizenz: **CC BY-SA 4.0**. Namensnennung (Perseus Digital Library / PerseusDL) erfolgt in der App-Info; die griechischen Textdaten werden dementsprechend unter denselben Bedingungen (CC BY-SA 4.0) weitergegeben. |

Zählung: kanonisch nach der griechischen Edition. Die Abschnittszählung von Deutsch, Englisch und Griechisch stimmt fast vollständig überein; ein systematischer Offset wurde in keiner Sprache und keinem Buch gefunden. `data-sources/overrides/remap.json` ist deshalb aktuell leer (`{ "de": {}, "en": {}, "grc": {} }`) — es gibt keine per Remap zu behebenden Verschiebungen.

## Bekannte Datenlücken und -artefakte

1. **Abschnitt 12-18 ohne griechischen Text (Editionslücke, keine Bug).** Die Perseus-Edition zählt Buch 12 durch von Kapitel 17 direkt zu Kapitel 19 — Kapitel 18 existiert dort nicht als eigenständiger Abschnitt. Ursache (in Task 5 verifiziert): Mitten im Fließtext von Kapitel 12.17 steht im XML die Marke `<del>ιη′</del>` (griechische Zahl 18) — ein antiker Abschreibfehler, bei dem eine Kapitelmarke versehentlich in den Fließtext statt an den Kapitelanfang geriet. Das ist eine seit der Editio princeps (Xylander) tradierte Zähleigenheit der *Selbstbetrachtungen*, kein Fehler unserer XML-Quelle oder unseres Parsers. Deutsch und Englisch haben dagegen einen eigenständigen Abschnitt 12.18. Ergebnis: In `data/quotes.json` fehlt die ID `12-18` vollständig (deutscher und englischer Text vorhanden, griechischer nicht) — dokumentiert in `data-sources/alignment-report.txt`.

2. **6 bekannte Wortstellungs-Ausreißer im deutschen Text (pdftotext-Artefakt, Wortlaut vollständig).** Betroffen: Buch 4 §34, Buch 6 §5, Buch 7 §51, Buch 7 §65, Buch 8 §42, Buch 12 §10 (1,2 % der 487 deutschen Abschnitte). Ursache (in Task 3 verifiziert): `pdftotext -layout` reißt bei extrem justiertem Flattersatz (v. a. Verszitaten) das letzte Wort der ersten Zeile heraus und setzt es direkt hinter die Abschnittsnummer statt ans Satzende (z. B. Buch 12 §10: „Zweck. Prüfe die Beschaffenheit … und den" statt „Prüfe die Beschaffenheit … und den Zweck."). Verifiziert als generischer `pdftotext`-Rekonstruktionsfehler bei dieser PDF (tritt auch ohne `-layout` auf), kein Artefakt unserer Flag-Wahl. Kein Textverlust — nur die Wortstellung am Anfang der betroffenen Abschnitte ist vertauscht. Bewusst nicht automatisch behoben (Aufwand/Nutzen bei 6 von 487 Fällen); bei Bedarf leicht manuell nachbesserbar.

Nicht alignierbare Abschnitte insgesamt: siehe `data-sources/alignment-report.txt` (1 von 487 möglichen Tripeln, nämlich 12-18 wie oben beschrieben).

## Bilder

| Bild | Quelle | Lizenz |
|---|---|---|
| Büste des Marc Aurel (Medaillon + Porträt in der App) | Glyptothek München; Foto: Bibi Saint-Pol, Wikimedia Commons („Marcus Aurelius Glyptothek Munich.jpg") | Gemeinfrei (Public Domain, vom Fotografen freigegeben) |

## Epiktet — Handbüchlein der Moral (Encheiridion)

Ergänzt am 2026-08-05 (Teilprojekt 5). IDs `e-1` … `e-53` in `data/enchiridion.json`, Zählung kanonisch nach der griechischen Edition (53 Kapitel).

| Sprache | Quelle | Nachweis |
|---|---|---|
| Deutsch | Carl Conz (Übers.), *Handbüchlein der stoischen Moral* (1864). Übersetzer 19. Jh. → gemeinfrei; derselbe Text ist bei Zeno.org gelistet und von LibriVox (ausschließlich gemeinfreie Werke) vertont. | PDF: `data-sources/Epiktet-Handbuechlein-Conz.pdf` (von susannealbers.de) |
| Englisch | George Long (Übers.), *The Enchiridion*, in: *A Selection from the Discourses of Epictetus with the Encheiridion* (1877). Long (1800–1879) → gemeinfrei. | Project Gutenberg **#10661**, `data-sources/pg-long-enchiridion.txt` |
| Altgriechisch | Epiktet, *Ἐγχειρίδιον*; Edition aus PerseusDL canonical-greekLit (tlg0557.tlg002, `perseus-grc2`). | Committet als `data-sources/tlg0557.tlg002.xml`. Lizenz: **CC BY-SA 4.0**, Namensnennung wie oben. |

Editions-Eigenheiten (beim Alignment verifiziert):

1. **Longs Edition verschmilzt Kapitel 50+51** zu einem Kapitel (sein LI/LII entspricht griechisch 52/53). Der Parser trennt am dokumentierten Satzanfang „How long will you then still defer …" und stellt die kanonische 53er-Zählung her.
2. **Conz unterteilt Kapitel in Verse** („I, 1." … „I, 5.") mit redaktionellen Zwischenüberschriften; Verse werden pro Kapitel zusammengeführt, Überschriften verworfen.

| Bild | Quelle | Lizenz |
|---|---|---|
| Epiktet-Porträt (Kupferstich-Frontispiz, 18. Jh.) | Wikimedia Commons | Gemeinfrei (ein antikes Porträt Epiktets existiert nicht) |

## Seneca — Von der Kürze des Lebens (De brevitate vitae)

Ergänzt am 2026-08-05 (dritter Autor). IDs `s-1` … `s-20` in `data/debrevitate.json`.
**Hinweis:** Der `grc`-Slot trägt bei Seneca das **lateinische** Original — der Slot bedeutet app-weit „Originalsprache"; die UI beschriftet ihn autorabhängig (Altgriechisch/Latein).

| Sprache | Quelle | Nachweis |
|---|---|---|
| Deutsch | Otto Apelt (Übers.), 1923, Felix Meiner, Leipzig. Apelt † 1932 → gemeinfrei seit 2003. | Internet Archive `von-der-kuerze-des-lebens-seneca`, committet als `data-sources/seneca-brevitate-de.txt` (UTF-8-konvertiert); Einleitung/Anmerkungen des Herausgebers werden beim Parsen verworfen |
| Englisch | John W. Basore (Übers.), Loeb 1932; US-Copyright nicht erneuert (PD-US-no-renewal, so auch Wikisource), Basore † 1949 → EU-gemeinfrei seit 2020. | en.wikisource „On the shortness of life", 20 Kapitelseiten, committet als `data-sources/seneca-brevitate-en.json` |
| Latein | Original, la.wikisource „De brevitate vitae" (20 Kapitel-Absätze). | Committet als `data-sources/seneca-brevitate-la.html` |
| Bild | Sog. Pseudo-Seneca-Büste, Museo Archeologico Nazionale Neapel; Foto **Marie-Lan Nguyen** (2011). | Wikimedia Commons, **CC BY 2.5** — Namensnennung erfolgt in App (Stoiker-Tab) und READMEs |
