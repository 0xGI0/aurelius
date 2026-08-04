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
