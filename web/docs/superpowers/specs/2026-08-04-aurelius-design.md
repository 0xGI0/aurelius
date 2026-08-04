# Aurelius — Design-Spezifikation

**Datum:** 2026-08-04 · **Status:** Zur Review · **Arbeitstitel:** Aurelius

## 1. Überblick

Eine ruhige, mehrsprachige Zitate-App zu Marc Aurels *Selbstbetrachtungen*. Ein Tap zeigt ein neues Zitat; auf Wunsch erklärt eine KI das Zitat live gestreamt. Die App läuft auf Android (APK), im Browser (Web-Deploy auf Vercel) und ist iOS-fähig — eine Codebase mit React Native + Expo.

## 2. Funktionale Anforderungen

- **Zitat per Tap:** Tap auf die Zitat-Karte zeigt einen zufälligen Abschnitt ohne baldige Wiederholung (Shuffle-Bag: alle Abschnitte einmal durchmischen, erst dann neu mischen).
- **Vollständiges Werk:** Die App enthält *alle* Abschnitte der Selbstbetrachtungen (12 Bücher, ca. 490 Abschnitte) — keine kuratierte Auswahl. Längere Abschnitte werden in der Karte scrollbar dargestellt.
- **Mehrsprachige Zitate:** Jede Passage liegt in drei Sprachen vor, umschaltbar per Sprachwähler:
  - **Deutsch:** Albert Wittstock (1879, historische Reclam-Universal-Bibliothek) — gemeinfrei.
  - **Englisch:** George Long (1862) — gemeinfrei.
  - **Altgriechisch:** Originaltext (gemeinfreie Edition, z. B. Teubner 1908).
- **Stellenangabe:** Jedes Zitat trägt seine Fundstelle („Buch IV, 7“).
- **KI-Erklärung (optional):** Button „Erklären“ streamt eine Erklärung des aktuellen Zitats Wort für Wort unter die Karte. Die Erklärung erscheint in der Sprache der Bedienoberfläche (Deutsch).
- **BYOK + Fallback:**
  1. Ist ein eigener Anthropic-API-Key hinterlegt → direkter API-Aufruf vom Gerät (Streaming).
  2. Sonst → Fallback über eine Vercel-Serverless-Function, die serverseitig den Gemini-Free-Tier-Key des Betreibers nutzt (Key liegt nie im Client).
  3. Weder Key noch Netz → freundlicher Inline-Hinweis; alle übrigen Funktionen bleiben nutzbar.
- **Einstellungen:** Zitat-Sprache, API-Key (eintragen/löschen), Theme (Hell/Dunkel/System).
- **Offline-fähig:** Zitate sind als JSON gebündelt; nur die KI-Erklärung braucht Netz.

## 3. Nicht-Ziele (MVP)

- Neugriechische Übersetzung (bewusst gestrichen — keine gemeinfreie Quelle).
- Favoriten, Teilen-Funktion, Push-Benachrichtigung „Zitat des Tages“.
- iOS-App-Store-Release (die Codebase bleibt iOS-fähig).
- Mehrsprachige Bedienoberfläche (UI bleibt Deutsch; nur die Zitate sind mehrsprachig).

## 4. Architektur

**Stack:** Expo (React Native, TypeScript), Expo Router mit zwei Routen.

```
aurelius/
├── app/                  # Expo Router
│   ├── index.tsx         # Home: Zitat-Karte, Sprachwähler, Erklären-Button
│   └── settings.tsx      # Einstellungen: Sprache, API-Key, Theme
├── components/           # QuoteCard, StreamingText, LanguageSwitch, …
├── data/quotes.json      # Kuratierte Passagen, alle Sprachen
├── lib/
│   ├── quotes.ts         # Laden + Shuffle-Bag-Auswahl
│   └── ai/
│       ├── provider.ts   # Interface: explainQuote(quote) → AsyncIterable<string>
│       ├── anthropic.ts  # BYOK, direkter Streaming-Call
│       └── gemini.ts     # Fallback via Vercel-Function
├── theme/                # Farben, Typografie, Spacing (Hell/Dunkel)
├── api/explain.ts        # Vercel-Serverless-Function (Gemini-Fallback)
└── docs/superpowers/specs/
```

**Datenmodell (quotes.json):**

```json
{
  "id": "4-7",
  "book": 4,
  "section": 7,
  "texts": {
    "de": "…",
    "en": "…",
    "grc": "…"
  }
}
```

**KI-Schicht:** Ein Provider-Interface `explainQuote(quote, targetLang) → AsyncIterable<string>`; die Auswahl-Logik prüft zuerst den hinterlegten Key. Anthropic-Provider nutzt das offizielle SDK mit Browser-Freigabe und Modell `claude-opus-5`; der Gemini-Provider ruft `/api/explain` auf, die Function streamt die Gemini-Antwort durch.

**Key-Speicherung:** `expo-secure-store` (nativ, verschlüsselt), `localStorage` im Web. Der Key verlässt das Gerät nur Richtung Anthropic-API.

## 5. Fehlerbehandlung

| Situation | Verhalten |
|---|---|
| Kein Netz | Zitate funktionieren; Erklären-Button zeigt Inline-Hinweis „Offline“ |
| Ungültiger API-Key | Inline-Hinweis mit Link zu den Einstellungen |
| Rate-Limit / Quota (Gemini-Fallback) | Inline-Hinweis „Gerade ausgelastet, später erneut versuchen oder eigenen Key hinterlegen“ |
| Stream bricht ab | Bisheriger Text bleibt stehen, Button „Erneut versuchen“ |

## 6. Design-Richtung

- **Stimmung:** Stoisch-ruhig, klassisch-modern. Tiefes Tintenblau/Anthrazit + warmes Elfenbein, Bronze als Akzent. Helles und dunkles Theme.
- **Typografie:** Serifen-Displayschrift für Zitate; klare Sans für Bedienelemente; für Altgriechisch eine Schrift mit sauberem **polytonischem** Glyphensatz (z. B. GFS Didot).
- **Motion:** Sanfte Überblendung beim Zitatwechsel; Streaming-Cursor bei der KI-Erklärung.
- **Claude-Design-Projekt:** Zusätzlich entsteht auf claude.ai/design ein Design-System-Projekt „Aurelius“ mit Karten für Palette, Typografie, Zitat-Karte und Buttons — als anschaubare Referenz; die Umsetzung erfolgt nativ in Expo.

## 7. Datenbeschaffung & Lizenz

- Übernahme des **vollständigen Werks** (12 Bücher, ca. 490 Abschnitte), skriptgestützt ausgerichtet über die Stellenangabe (Buch/Abschnitt), aus gemeinfreien Quellen: Wittstock (zeno.org/Wikisource), Long (Project Gutenberg), griechischer Originaltext (Perseus/Gutenberg). Erwarteter Umfang: ca. 1–1,5 MB JSON — unproblematisch für das App-Bundle, weiterhin komplett offline.
- **Alignment-Prüfung:** Die Abschnittszählung weicht zwischen Editionen stellenweise ab; das Import-Skript prüft die Abschnittszahl pro Buch gegen alle drei Quellen und meldet Abweichungen zur manuellen Klärung.
- **Arbeitsschritt Lizenzverifikation:** Vor Übernahme wird für jede Quelle Gemeinfreiheit und exakte Edition verifiziert und in `data/SOURCES.md` dokumentiert. Moderne Übersetzungen (z. B. aktuelle Reclam-Ausgaben) werden nicht verwendet.

## 8. Build & Deploy

- **Entwicklung:** Expo Dev Server; Test per Expo Go (QR-Code) und Browser.
- **Web:** Statischer Expo-Web-Export, deployt auf Vercel; die Serverless-Function `/api/explain` liegt im selben Vercel-Projekt.
- **Android:** APK über EAS Build (Cloud, Free-Tier); Verteilung zunächst direkt (Sideload), Play Store optional später.
- **Annahme zu verifizieren:** Existenz/Konditionen des Gemini-Free-Tiers zum Bauzeitpunkt. Falls entfallen: App bleibt BYOK-only voll funktionsfähig; die Function wird dann nicht deployt.

## 9. Tests & Erfolgskriterien

**Unit-Tests (Jest):** Shuffle-Bag (keine Wiederholung bis Bag leer), Provider-Auswahl (Key → Anthropic, sonst Fallback), Fehlerpfade der KI-Schicht.

**Erfolgskriterien (MVP fertig, wenn):**
1. App startet in Expo Go und im Browser; Zitatwechsel und Sprachumschaltung funktionieren offline; alle 12 Bücher sind vollständig enthalten (Stichproben-Abgleich des Alignments über mehrere Bücher).
2. Mit hinterlegtem Anthropic-Key streamt die Erklärung live.
3. Ohne Key greift der Gemini-Fallback über die Vercel-Function (sofern Free-Tier verfügbar).
4. Android-APK lässt sich bauen und installieren.
5. Alle Zitat-Quellen sind in `data/SOURCES.md` mit Lizenznachweis dokumentiert.
