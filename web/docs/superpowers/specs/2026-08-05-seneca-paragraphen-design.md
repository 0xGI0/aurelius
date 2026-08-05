# Seneca: Paragraphen-Struktur + deutsche Lücken — Design

**Datum:** 2026-08-05 · **Status:** Vom Nutzer freigegeben (alle vier Abschnitte)

## Anlass

Zwei Befunde vom 2026-08-05:
1. Senecas *De brevitate vitae* liegt als 20 Kapitel-Blöcke vor
   (Median ~1.900 Zeichen de) — als Zitat-Einheiten viel zu lang; alle
   Konsumenten (App-Zitatkarte, Quote-API, /geist) müssen kürzen.
2. Die deutsche Fassung (Apelt 1923, aus Archive-Item
   `von-der-kuerze-des-lebens-seneca`) hat in 6–8 Kapiteln große Lücken:
   de/la-Verhältnis 0,19–0,51 statt normal 1,4–1,6 (s-4, s-7, s-9, s-10,
   s-17, s-2; Beleg: Kapitel 4 enthält nur §4,1 — der Augustus-Teil fehlt).
   Englisch (Basore) ist durchgehend vollständig (en/la stabil 1,27–1,43).

## Entscheidungen (vom Nutzer bestätigt)

| Frage | Entscheidung |
|---|---|
| Struktur | Klassische Paragraphen (~100 Einheiten) statt 20 Kapitel |
| Alignment de/en → la | Satz für Satz inhaltlich geprüft (nicht heuristisch) |
| Android | Im selben Zug, Release android-v0.4.1 |
| Anderes Seneca-Werk stattdessen | Nein — es gibt kein kurzgliedriges; Paragraphen lösen das |

## 1. Datenmodell & IDs

- `web/data/debrevitate.json`: Einträge
  `{ id: "s-<kap>-<par>", chapter, paragraph, texts: { de, en, grc } }` —
  der `grc`-Slot trägt weiterhin das Latein (App-Konvention).
- `lib/corpus.ts` mappt Seneca auf `Quote { book: chapter,
  section: paragraph }` — strukturell wie Marc Aurel (Buch→Abschnitt).
- Referenzen: App „De brevitate 4,2"; Quote-API `ref` „Kap. 4,2" / „Ch. 4,2".
- Alte IDs `s-1…s-20` entfallen; Übergangsregeln in §3/§4.

## 2. Quellen & Alignment-Pipeline

- **Latein (Struktur-Anker):** la.wikisource „De brevitate vitae" —
  Volltext auf einer Seite mit klassischer `[1] [2]`-Paragraphenzählung
  (live verifiziert). Wird als neue Quelldatei committet und ersetzt die
  markuplose `seneca-brevitate-la.html`.
- **Deutsch:** Apelt vervollständigen. Primär: HTML-/PDF-Fassung desselben
  Archive-Items (war bei der Recherche zeitweise unerreichbar — bei der
  Umsetzung erneut ziehen). Fallback, falls das Item selbst gekürzt ist:
  die vollständige Fassung auf seneca.pushpak.de identifizieren (Abgleich
  mit Moser 1829 u. a.) oder eine andere belegbare gemeinfreie Übersetzung.
  **Es kommt nichts Unbelegtes in den Korpus**; SOURCES.md wird
  entsprechend fortgeschrieben.
- **Englisch:** Basore/Wikisource-Kapiteltexte (vorhanden, vollständig).
- **Alignment-Artefakte:** `data-sources/seneca-align/` — pro Kapitel eine
  Datei mit Einträgen `{ id, la, de, en }`, Satz für Satz inhaltlich
  zugeordnet und geprüft; der Build (`scripts/build-brevitate.ts`) erzeugt
  daraus `debrevitate.json`.
- **Qualitäts-Gates (Build bricht sonst ab):** Paragraphenzahl = Zahl der
  Latein-Paragraphen; kein leerer Sprach-Slot; Längenverhältnis je
  Paragraph de/la in [1,1–2,0], en/la in [1,1–1,7]; Ausreißer werden
  gelistet und einzeln begründet oder korrigiert.

## 3. Web, Backend & Migrationen

- **Web:** `corpus.ts`/`referenceLabel` (Format „De brevitate 4,2"),
  Lese-/Bücher-Ansicht gruppiert Paragraphen nach Kapiteln (Bauart der
  Aurel-Bücher), `tag-topics.ts` läuft neu über ~100 Paragraphen
  (Heuristik + Stichproben-Review der Zuordnungen).
- **Favoriten Web:** Storage-Shim (`lib/storage-migration.ts`) erhält
  einen Schritt `s-N` → `s-N-1` (Kapitel-Favorit wird zum ersten
  Paragraphen des Kapitels).
- **Backend:** Quote-ID-Regex akzeptiert übergangsweise `s-\d+` UND
  `s-\d+-\d+` (Android-0.4.0-Clients dürfen nicht brechen); Migration hebt
  gespeicherte `s-N`-Favoriten auf `s-N-1`.
- **Quote-API & /geist:** kein Code-Change (datengetrieben). Die
  /geist-Kürzung bleibt als Sicherheitsnetz bestehen.

## 4. Android & Release

- Daten-Assets synchen (debrevitate.json, topics.json), `Quote`-Modell und
  Referenzformat auf chapter/paragraph, BooksScreen: Kapitel→Paragraphen
  (Bauart der Aurel-Bücher), Room-Migration `s-N` → `s-N-1`
  (Schema-Version anheben, SQL-Update auf der Favoriten-Tabelle).
- Version 0.4.1, Release-Tag `android-v0.4.1` über die bestehende Pipeline
  (inkl. SBOM/Attestation und lokalem PGP-Schritt `sign-release.sh`).

## Erfolgs-Kriterien

1. `debrevitate.json` enthält ~100 Paragraphen; jedes Kapitel vollständig
   (de/la-Verhältnis je Kapitel 1,3–1,7 — die heutigen Lücken-Kapitel
   eingeschlossen); Latein deckungsgleich mit Wikisource-Zählung.
2. Alle Bestands-Tests grün (Web-Jest, Android-JVM, Django) plus neue
   Tests für Parser/Build-Gates.
3. Web live: Seneca-Leseansicht zeigt Kapitel→Paragraphen; Zitatkarte
   zeigt Paragraphen-Referenzen („De brevitate 4,2").
4. Quote-API liefert Paragraphen-IDs; /geist zeigt Seneca ohne Kürzung in
   der Regel (Ausnahmen: wenige lange Paragraphen).
5. Favoriten-Migration verifiziert in allen drei Speichern (Web-Storage,
   Backend-DB, Android-Room); Backend akzeptiert alte und neue IDs.
6. Release `android-v0.4.1` mit allen Artefakten veröffentlicht.
