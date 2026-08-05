# Zweisprachige READMEs nach Stoa-Rename — Design

**Datum:** 2026-08-05 · **Status:** Vom Nutzer freigegeben

## Ziel

1. **`stoa/README.md`** (Monorepo-Root) wird zweisprachig (Deutsch/English),
   mit zentriertem Logo (`web/docs/logo.png`), den drei Stoiker-Porträts
   (`web/assets/images/marcus-portrait.jpg`, `epictetus.jpg`, `seneca.jpg`)
   und Sprach-Ankern wie im `web/README.md`. Je Sprache: Kurzbeschreibung
   (drei Stoiker, Texte de/en/Original, Favoriten, KI-Erklärung), Live-Link
   https://die-stoa.vercel.app, Teilprojekt-Tabelle (`web/`, `android/`,
   `backend/`), Link zum aktuellen Android-Release, SECURITY-Verweis,
   kurze Umzugsnotiz (ex-Aurelius, drei Alt-Repos).
2. **Profil-README `0xGI0/0xGI0`**: Nur die Aurelius-Zeile in „📱 Apps" wird
   zur Stoa-Zeile — Logo von
   `raw.githubusercontent.com/0xGI0/stoa/main/web/docs/logo.png`,
   Beschreibung auf drei Stoiker erweitert (486 Abschnitte + 53 + 20
   Kapitel), Links: Repo `0xGI0/stoa`, Web die-stoa.vercel.app,
   Android-Releases im Monorepo. Alles andere bleibt unverändert.
3. **Vercel**: `commandForIgnoringBuildStep` = `git diff --quiet HEAD^ HEAD -- .`
   (wirkt relativ zum Root Directory `web`) — keine Leer-Deploys mehr bei
   reinen Android-/Backend-/Root-Doku-Pushes.

Beide READMEs werden committet und gepusht.
