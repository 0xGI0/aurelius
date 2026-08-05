<p align="center">
  <img src="docs/logo.png" width="140" alt="Stoa-Logo: Lorbeerkranz">
</p>
<h1 align="center">Stoa</h1>
<p align="center">
  <a href="#deutsch">Deutsch</a> · <a href="#english">English</a>
</p>
<p align="center">
  <img src="assets/images/marcus-portrait.jpg" width="180" alt="Büste des Marc Aurel (Glyptothek München)">
  &nbsp;
  <img src="assets/images/epictetus.jpg" width="152" alt="Epiktet (Kupferstich, Oxford 1715)">
  &nbsp;
  <img src="assets/images/seneca.jpg" width="168" alt="Pseudo-Seneca-Büste (Foto: Marie-Lan Nguyen, CC BY 2.5)">
</p>

---

## Deutsch

Eine ruhige, zweisprachige App für die **großen Stoiker**: Marc Aurels
*Selbstbetrachtungen* (**486 Abschnitte**), Epiktets *Handbüchlein der
Moral* (**53 Kapitel**) und Senecas *Von der Kürze des Lebens*
(**20 Kapitel**) — jeweils auf Deutsch, Englisch und im Original
(Altgriechisch bzw. Latein), mit Themen-Filtern, Favoriten und
optionaler KI-Erklärung als Live-Stream.

**Live:** https://die-stoa.vercel.app

**Schwester-Projekte:** [`android/`](../android/)
(native Kotlin-App, GPL-3.0, F-Droid in Vorbereitung) ·
[`backend/`](../backend/)
(Konto- & Favoriten-Sync-Server, Django)

### Features

- **Zwei Autoren, ein Umschalter** — Marc Aurel oder Epiktet, die Wahl bleibt gespeichert; der Stoiker-Tab porträtiert beide und erklärt ihre Unterschiede
- **Neuer Gedanke per Knopfdruck** — zufälliger Abschnitt (Shuffle ohne baldige Wiederholung), Zitattext markier- und kopierbar
- **Themen-Filter** — Tod, Wut, Trauer, Angst, Familie, Besitz, Gelassenheit, Pflicht, Natur
- **Drei Zitat-Sprachen** — Wittstock 1879 (de), George Long 1862 (en), griechischer Originaltext (grc), umschaltbar
- **Zweisprachige Oberfläche** — Deutsch/Englisch
- **Bücher-Browser** — alle 12 Bücher bzw. Kapitel bis zum einzelnen Abschnitt
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

Konto-Funktionen lokal testen: [`backend/`](../backend/)
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
[`android/`](../android/) — signierte APKs
gibt es dort unter [Releases](https://github.com/0xGI0/stoa/releases).

---

## English

A calm, bilingual app for the **great Stoics**: Marcus Aurelius' *Meditations*
(**486 sections**), Epictetus' *Enchiridion* (**53 chapters**) and Seneca's
*On the Shortness of Life* (**20 chapters**) — each in German, English and
the original (Ancient Greek or Latin), with topic filters, favorites and
optional AI explanations streamed live.

**Live:** https://die-stoa.vercel.app

**Sister projects:** [`android/`](../android/)
(native Kotlin app, GPL-3.0, F-Droid in preparation) ·
[`backend/`](../backend/)
(account & favorites sync server, Django)

### Features

- **Two authors, one switch** — Marcus Aurelius or Epictetus, the choice is remembered; the Stoics tab portrays both and explains their differences
- **New thought at the press of a button** — random section (shuffle without early repeats), quote text selectable and copyable
- **Topic filters** — death, anger, grief, fear, family, possessions, equanimity, duty, nature
- **Three quote languages** — Wittstock 1879 (de), George Long 1862 (en), the Greek original (grc), switchable
- **Bilingual interface** — German/English
- **Book browser** — all 12 books and chapters down to the individual section
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
[`backend/`](../backend/) and start the
dev server with `EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000`.

### Android

The Android app is its own **native Kotlin app**:
[`android/`](../android/) — signed APKs
are available under [Releases](https://github.com/0xGI0/stoa/releases).

### Text licenses

All source texts are in the public domain; the Greek edition (PerseusDL) is
licensed CC BY-SA 4.0 — attributions in [`data/SOURCES.md`](data/SOURCES.md).
Bust photo: Bibi Saint-Pol, Wikimedia Commons, public domain.
