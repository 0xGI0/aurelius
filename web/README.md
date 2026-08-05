<p align="center">
  <img src="docs/logo.png" width="140" alt="Aurelius-Logo: Lorbeerkranz mit A">
</p>
<h1 align="center">Aurelius</h1>
<p align="center">
  <a href="#deutsch">Deutsch</a> · <a href="#english">English</a>
</p>
<p align="center">
  <img src="assets/images/marcus-portrait.jpg" width="240" alt="Büste des Marc Aurel (Glyptothek München)">
</p>

---

## Deutsch

Eine ruhige, zweisprachige App für Marc Aurels *Selbstbetrachtungen* — das
komplette Werk (12 Bücher, **486 Abschnitte**) auf Deutsch, Englisch und
Altgriechisch, mit Themen-Filtern, Favoriten und optionaler KI-Erklärung
als Live-Stream.

**Live:** https://aurelius-rust.vercel.app

**Schwester-Projekte:** [aurelius-android](https://github.com/0xGI0/aurelius-android)
(native Kotlin-App, GPL-3.0, F-Droid in Vorbereitung) ·
[aurelius-backend](https://github.com/0xGI0/aurelius-backend)
(Konto- & Favoriten-Sync-Server, Django)

### Features

- **Neuer Gedanke per Knopfdruck** — zufälliger Abschnitt (Shuffle ohne baldige Wiederholung), Zitattext markier- und kopierbar
- **Themen-Filter** — Tod, Wut, Trauer, Angst, Familie, Besitz, Gelassenheit, Pflicht, Natur
- **Drei Zitat-Sprachen** — Wittstock 1879 (de), George Long 1862 (en), griechischer Originaltext (grc), umschaltbar
- **Zweisprachige Oberfläche** — Deutsch/Englisch
- **Bücher-Browser** — alle 12 Bücher bis zum einzelnen Abschnitt, plus kuratierte „Stoische Bibliothek"
- **Ausgewählt** — eigene Zitat-Sammlung per Stern; lokal, mit Konto geräteübergreifend synchronisiert (Aktivierung mit dem Server-Go-Live)
- **Über Marc Aurel & Die Stoa** — Kurzbiografie und Einführung
- **KI-Erklärung** — eigener Anthropic-Key (direkt vom Gerät, Streaming) oder Gemini-Fallback über eine Vercel-Function
- Helles & dunkles Theme

### Entwicklung

```bash
npm install
npx expo start        # QR-Code für Expo Go, oder w für den Browser
npm test              # Jest
npx tsc --noEmit      # Typprüfung
```

Konto-Funktionen lokal testen: [aurelius-backend](https://github.com/0xGI0/aurelius-backend)
starten und den Dev-Server mit `EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000` aufrufen.

### Daten-Pipeline

Die Texte werden aus gemeinfreien Quellen gebaut (Details und Lizenznachweise:
[`data/SOURCES.md`](data/SOURCES.md)):

```bash
npx tsx scripts/extract-de.ts    # Wittstock-PDF → de.json
npx tsx scripts/extract-en.ts    # Project Gutenberg #15877 → en.json
npx tsx scripts/extract-grc.ts   # PerseusDL TEI-XML → grc.json
npx tsx scripts/build-quotes.ts  # Merge + Alignment → data/quotes.json
npx tsx scripts/tag-topics.ts    # Themen-Heuristik → data/topics.json
```

### Deploy (Web)

Vercel: `buildCommand` ist `npx expo export -p web`, Function `api/explain.ts`
liefert den Gemini-Fallback. Env-Vars: `GEMINI_API_KEY`,
`EXPO_PUBLIC_BACKEND_URL` (Konto-Server, ab Go-Live). Client-Konfiguration:
`EXPO_PUBLIC_EXPLAIN_URL` in `.env`.

### Android

Die Android-App ist eine **eigene native Kotlin-App**:
[aurelius-android](https://github.com/0xGI0/aurelius-android) — signierte APKs
gibt es dort unter [Releases](https://github.com/0xGI0/aurelius-android/releases).

---

## English

A calm, bilingual app for Marcus Aurelius' *Meditations* — the complete work
(12 books, **486 sections**) in German, English and Ancient Greek, with topic
filters, favorites and optional AI explanations streamed live.

**Live:** https://aurelius-rust.vercel.app

**Sister projects:** [aurelius-android](https://github.com/0xGI0/aurelius-android)
(native Kotlin app, GPL-3.0, F-Droid in preparation) ·
[aurelius-backend](https://github.com/0xGI0/aurelius-backend)
(account & favorites sync server, Django)

### Features

- **New thought at the press of a button** — random section (shuffle without early repeats), quote text selectable and copyable
- **Topic filters** — death, anger, grief, fear, family, possessions, equanimity, duty, nature
- **Three quote languages** — Wittstock 1879 (de), George Long 1862 (en), the Greek original (grc), switchable
- **Bilingual interface** — German/English
- **Book browser** — all 12 books down to the individual section, plus a curated "Stoic Library"
- **Selected** — your own collection via the star; local, or synced across devices with an account (activated with the server go-live)
- **About Marcus Aurelius & The Stoa** — short biography and introduction
- **AI explanation** — your own Anthropic key (straight from the device, streaming) or a Gemini fallback via a Vercel function
- Light & dark theme

### Development

```bash
npm install
npx expo start        # QR code for Expo Go, or press w for the browser
npm test              # Jest
npx tsc --noEmit      # type check
```

To test account features locally, run
[aurelius-backend](https://github.com/0xGI0/aurelius-backend) and start the
dev server with `EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000`.

### Android

The Android app is its own **native Kotlin app**:
[aurelius-android](https://github.com/0xGI0/aurelius-android) — signed APKs
are available under [Releases](https://github.com/0xGI0/aurelius-android/releases).

### Text licenses

All source texts are in the public domain; the Greek edition (PerseusDL) is
licensed CC BY-SA 4.0 — attributions in [`data/SOURCES.md`](data/SOURCES.md).
Bust photo: Bibi Saint-Pol, Wikimedia Commons, public domain.
