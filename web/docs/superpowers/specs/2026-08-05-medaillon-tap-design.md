# Medaillon-Tap = Neuer Gedanke — Design

**Datum:** 2026-08-05 · **Status:** Vom Nutzer freigegeben · Nur Web-App.

Das Autoren-Medaillon auf dem Zitat-Screen (`app/(tabs)/index.tsx`) wird ein
`Pressable`, das das bestehende `drawNext` auslöst — gleiche Fade-Animation,
gleicher Zieh-Pool (Autor + Themen-Filter) wie der „Neuer Gedanke"-Knopf,
der unverändert bleibt. Pressed-Feedback: kurzes Abdimmen (opacity), kein
neuer Effekt. A11y: `accessibilityRole="button"`, Label „{Autor} — {neuer
Gedanke}" aus den bestehenden i18n-Keys.
