# Design: Epiktets Handbüchlein der Moral in Aurelius (Teilprojekt 5)

**Datum:** 2026-08-05 · **Status:** Entwurf — wartet auf Review

## Ziele

Aurelius (Name bleibt — User-Entscheidung) bekommt einen **zweiten Autor**:
Epiktets *Handbüchlein der Moral* (Encheiridion, 53 Kapitel) in denselben
drei Sprachen. Gleiche Repos, gleiche Apps — Web, Android und Backend werden
erweitert, nichts wird neu aufgesetzt.

- **Autoren-Umschalter**: zwischen Marc Aurel und Epiktet wechseln (persistiert)
- Epiktet-Texte **de/en/grc**, Themen-Filter auch für Epiktet
- **Über-Seiten**: Epiktet-Biografie + ein Abschnitt „Marc Aurel & Epiktet —
  die Unterschiede" (Kaiser vs. Sklave, privates Notizbuch vs. Lehrtext usw.)
- **Epiktet-Bild** in App (Über-Seite) und READMEs
- Favoriten und Sync funktionieren für beide Autoren

## Quellen (recherchiert & geprüft am 2026-08-05)

| Sprache | Quelle | Lizenz |
|---|---|---|
| de | **Carl Conz (1864)** — exakt der Text des User-PDFs (susannealbers.de); identisch auf Zeno.org, von LibriVox als gemeinfrei vertont | gemeinfrei ✓ |
| en | **George Long (1877)**, Project Gutenberg — derselbe Übersetzer wie bei den Meditations | gemeinfrei ✓ |
| grc | **PerseusDL** canonical-greekLit, Epiktet Encheiridion (tlg0557.tlg002) | CC BY-SA 4.0 ✓ |
| Bild | Kupferstich-Frontispiz einer Enchiridion-Ausgabe (18. Jh.), Wikimedia Commons — ein antikes Porträt existiert nicht | gemeinfrei ✓ |

## Datenmodell

- Neue Datei `data/enchiridion.json`, gleiche Struktur wie `quotes.json`,
  **IDs `e-1` … `e-53`** (Kapitel-Granularität; lange Kapitel scrollen in der
  Karte — Scroll-Leiste existiert seit heute). Feld `book` entfällt / ist 0.
- `data/topics.json` erweitert: bestehende 9 Themen bekommen zusätzlich
  passende `e-*`-IDs (gleiche Regex-Heuristik, `scripts/tag-topics.ts`).
- **Backend**: `quote_id`-Validierung wird zu `^(\d{1,2}-\d{1,3}|e-\d{1,2})$`
  (Modell-Validator + View-Regex + Tests). Sonst keine Backend-Änderung —
  Favoriten sind autoren-agnostische IDs.
- Apps validieren analog; Favoriten-Anzeige löst `e-*` gegen Epiktet auf.

## UI (beide Apps, Parität)

- **Zitat-Tab**: unter dem Header ein Segmented **„Marc Aurel | Epiktet"**;
  Wechsel = neuer ShuffleBag über das jeweilige Werk, Themen-Filter filtert
  im aktiven Werk. Referenzzeile bei Epiktet: **„Handbuch, 5"** / „Manual, 5"
  (statt „Buch V, 12").
- **Bücher-Tab**: folgt dem gewählten Autor — Marc Aurel: 12 Bücher wie bisher;
  Epiktet: Liste der 53 Kapitel (eine Ebene, direkte Leseansicht). Die
  „Stoische Bibliothek" bleibt darunter.
- **Autoren-Tab** (bisher „Marc Aurel"): zeigt den **gewählten** Autor —
  Marc-Aurel-Seite wie bisher; Epiktet-Seite neu (Porträt-Stich, Biografie:
  Sklave in Rom → Freilassung → Lehrer in Nikopolis; Arrian schrieb mit).
  Darunter auf beiden Seiten der neue Abschnitt **„Zwei Stoiker — die
  Unterschiede"**. Tab-Label wird zu „Die Stoiker" (de) / "The Stoics" (en).
- Einstellung `aurelius.author` = `"aurel" | "epiktet"` (Default aurel),
  gespeichert wie die anderen Einstellungen.
- KI-Erklärung: Prompt erwähnt das jeweilige Werk („Passage aus Epiktets
  ›Handbüchlein der Moral‹ (Handbuch, 5)").

## Nicht-Ziele

- Kein Rename (App heißt weiter Aurelius, Untertitel nennt beide Werke)
- Keine Discourses/Seneca (später denkbar — Datenmodell lässt es zu)
- Kein separates Epiktet-Repo

## Teilschritte (je eigener Plan-Task, Reihenfolge)

1. **Datenpipeline** (aurelius-Repo): `scripts/extract-ench-{de,en,grc}.ts`
   + `build-enchiridion.ts` (Merge/Alignment auf 53 Kapitel) + Topic-Tagging;
   Tests: 53 Einträge, alle 3 Sprachen nicht-leer, IDs `e-1..e-53`.
2. **Backend**: Regex/Validator + Tests erweitern, deployt sich beim Go-Live.
3. **Web-App**: Author-Setting, Umschalter, Bücher/Autoren-Tab, i18n (~25 neue
   Keys inkl. Bio + Unterschiede), Referenzformat, Favoriten-Auflösung.
4. **Android-App**: dito nativ (Assets, SettingsStore, UI, Strings).
5. **READMEs/Bilder**: Epiktet-Stich in alle drei READMEs + App-Assets,
   Feature-Listen und SOURCES.md aktualisieren; neue Releases (Web-Deploy,
   Android v0.2.0).
