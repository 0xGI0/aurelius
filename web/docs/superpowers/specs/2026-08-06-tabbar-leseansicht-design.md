# Tab-Bar in Lese-/Buch-Ansicht — Design

**Datum:** 2026-08-06 · **Status:** Vom Nutzer freigegeben · Nur Web.

Befund: `read/[id]` und `book/[book]` liegen außerhalb der `(tabs)`-Gruppe
und rendern als Vollbild-Screens ohne Tab-Bar. Fix: beide Routen in die
Gruppe verschieben (`app/(tabs)/read/[id].tsx`, `app/(tabs)/book/[book].tsx`)
und im Tab-Layout als versteckte Screens (`href: null`) registrieren —
Tab-Bar bleibt sichtbar, kein eigener Tab-Knopf, kein Tab aktiv markiert.
URLs bleiben `/read/…` und `/book/…` (Gruppen-Segmente erscheinen nicht in
der URL); Deep-Link-Export (`dist/read/[id].html`, `dist/book/[book].html`)
wird nach dem Umbau explizit verifiziert, die Vercel-Rewrites bleiben
unverändert. Import-Pfade der zwei Dateien eine Ebene tiefer; die
Stack-Einträge im Root-Layout entfallen.
