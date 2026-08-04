# Aurelius

Eine ruhige, zweisprachige App für Marc Aurels *Selbstbetrachtungen* — das komplette Werk (12 Bücher, 486 Abschnitte) auf Deutsch, Englisch und Altgriechisch, mit optionaler KI-Erklärung als Live-Stream.

**Live:** https://aurelius-rust.vercel.app

## Features

- **Zitat per Tap** — zufälliger Abschnitt (Shuffle ohne baldige Wiederholung), Themen-Filter (Tod, Wut, Trauer, Angst, Familie, Besitz, Gelassenheit, Pflicht, Natur)
- **Drei Zitat-Sprachen** — Wittstock 1879 (de), George Long 1862 (en), griechischer Originaltext (grc), umschaltbar
- **Zweisprachige Oberfläche** — Deutsch/Englisch, in den Einstellungen umschaltbar
- **Bücher-Browser** — alle 12 Bücher bis zum einzelnen Abschnitt, plus kuratierte „Stoische Bibliothek"
- **Ausgewählt** — eigene Zitat-Sammlung per Stern (lokal gespeichert)
- **Über Marc Aurel & Die Stoa** — Kurzbiografie und Einführung
- **KI-Erklärung** — eigener Anthropic-Key (direkt vom Gerät, Streaming) oder Gemini-Fallback über eine Vercel-Function
- Helles & dunkles Theme, läuft im Browser und als Android-App

## Entwicklung

```bash
npm install
npx expo start        # QR-Code für Expo Go, oder w für den Browser
npm test              # Jest
npx tsc --noEmit      # Typprüfung
```

### Daten-Pipeline

Die Texte werden aus gemeinfreien Quellen gebaut (Details und Lizenznachweise: [`data/SOURCES.md`](data/SOURCES.md)):

```bash
npx tsx scripts/extract-de.ts    # Wittstock-PDF → de.json
npx tsx scripts/extract-en.ts    # Project Gutenberg #15877 → en.json
npx tsx scripts/extract-grc.ts   # PerseusDL TEI-XML → grc.json
npx tsx scripts/build-quotes.ts  # Merge + Alignment → data/quotes.json
npx tsx scripts/tag-topics.ts    # Themen-Heuristik → data/topics.json
```

### Deploy (Web)

Vercel: `buildCommand` ist `npx expo export -p web`, Function `api/explain.ts` liefert den Gemini-Fallback. Env-Var: `GEMINI_API_KEY`. Client-Konfiguration: `EXPO_PUBLIC_EXPLAIN_URL` in `.env`.

### Android-APK

```bash
npx eas-cli build -p android --profile preview
```

## KI & Schlüssel

Ohne Key funktioniert die App vollständig (Zitate offline). Für die Erklärung: eigenen Anthropic-API-Key (console.anthropic.com) in den Einstellungen hinterlegen — er bleibt auf dem Gerät. Alternativ greift der serverseitige Gemini-Fallback, sofern der Betreiber `GEMINI_API_KEY` gesetzt hat.

## Lizenz der Texte

Alle Werktexte sind gemeinfrei; die griechische Edition (PerseusDL) steht unter CC BY-SA 4.0 — Nachweise in [`data/SOURCES.md`](data/SOURCES.md). Büsten-Foto: Bibi Saint-Pol, Wikimedia Commons, gemeinfrei.
