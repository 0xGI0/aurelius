# Stoa: Umbenennung & Monorepo-Zusammenführung — Design

**Datum:** 2026-08-05
**Status:** Vom Nutzer freigegeben (alle vier Abschnitte)

## Ziel

Das Projekt „Aurelius" (Expo-Web-App, Kotlin-Android-App, Django-Backend) heißt
künftig **Stoa**, weil es neben Marc Aurel inzwischen auch Epiktet und Seneca
umfasst. Die drei bisherigen Repos (`0xGI0/aurelius`, `0xGI0/aurelius-android`,
`0xGI0/aurelius-backend`) werden zu **einem Monorepo `0xGI0/stoa`**
zusammengeführt.

## Entscheidungen (vom Nutzer bestätigt)

| Frage | Entscheidung |
|---|---|
| Neuer Name | Stoa |
| Rename-Tiefe | Komplett, inkl. Android-`applicationId` |
| Git-History | Aller drei Repos übernehmen |
| Repo-Ansatz | Echtes Monorepo mit `web/`, `android/`, `backend/` |
| APK-Bruch | Akzeptiert: v0.3.0-Installationen brauchen einmalige Neuinstallation |
| Alte Repos | Archivieren, nicht löschen |

## 1. Repo & History-Migration

- GitHub-Repo `0xGI0/aurelius` wird auf **`0xGI0/stoa`** umbenannt.
  Dadurch bleiben GitHub-Redirects, Issues, Stars und die Vercel-Verknüpfung
  erhalten.
- Historien-Zusammenführung mit `git filter-repo`:
  - `aurelius` → alles nach `web/` verschoben
  - `aurelius-android` → alles nach `android/` verschoben,
    Tags umbenannt: `v0.1.0`–`v0.3.0` → `android-v0.1.0`–`android-v0.3.0`
  - `aurelius-backend` → alles nach `backend/`
  - Merge der drei Historien mit `--allow-unrelated-histories`, danach
    Force-Push nach `0xGI0/stoa` (main).
- `aurelius-android` und `aurelius-backend` werden **archiviert** mit
  Hinweis-README auf `stoa`. Das v0.3.0-Release (APK, SBOM, Signaturen)
  bleibt dort dauerhaft einsehbar.
- Lokal entsteht `~/Dokumente/Github/stoa`; die drei alten Ordner bleiben
  bis zur bestätigten Fertigstellung unangetastet liegen.

## 2. Namens-Änderungen im Code

### Web (`web/`)
- `app.json`: name „Stoa", slug „stoa", scheme „stoa"
- `package.json`-Name, sichtbare App-Titel, i18n-Strings mit Produktnamen
- **Migrations-Shim für localStorage-Keys** (Favoriten, Settings):
  beim Start einmalig alte `aurelius…`-Keys lesen und auf neue Keys
  übertragen, damit Web-Nutzer nichts verlieren
- Inhaltliche Nennungen von Marc Aurel/„Aurelius" als Autor bleiben unberührt

### Android (`android/`)
- `applicationId` und `namespace`: `io.github.oxgi0.aurelius` →
  **`io.github.oxgi0.stoa`**; Package-Verzeichnisse entsprechend umbenannt
- `app_name` → „Stoa", `rootProject.name`, Fastlane-Metadata, RELEASING.md
- Bestehender Signing-Keystore wird weiterverwendet (Key hängt nicht am
  Package-Namen)
- Version → **0.4.0** (erstes Stoa-Release)

### Backend (`backend/`)
- CORS-Eintrag auf neue Vercel-URL
- `DEFAULT_FROM_EMAIL`, READMEs, Docs

## 3. CI/CD & Releases

- Workflows zusammengeführt unter `.github/workflows/`:
  - `web-ci.yml` — Trigger nur bei Änderungen unter `web/**`
  - `android-ci.yml` — Trigger bei `android/**`
  - `backend-ci.yml` — Trigger bei `backend/**`
  - `android-release.yml` — Trigger auf Tags `android-v*`; Pipeline
    unverändert: Keystore-Signing, SHA256SUMS, CycloneDX-SBOM,
    Sigstore-Attestation, PGP-Signaturen
  - ein gemeinsames `scorecard.yml`
- Eine `SECURITY.md` im Root, eine Dependabot-Config mit drei Ökosystemen
  (npm in `/web`, gradle in `/android`, pip in `/backend`)
- Vercel: Projekt auf „stoa" umbenennen, **Root Directory `web`** setzen →
  neue Domain `stoa-*.vercel.app`; Backend-CORS entsprechend nachziehen.
  **Reihenfolge:** Root Directory wird *vor* dem Force-Push der neuen
  Monorepo-History gesetzt, damit kein Deploy gegen die alte
  Verzeichnisstruktur läuft
- F-Droid (noch nicht eingereicht): Metadata zeigt später auf das Monorepo
  mit `subdir`-Angabe — von F-Droid regulär unterstützt

## 4. Risiken & Übergang

- **APK-Bruch (akzeptiert):** v0.3.0-Installationen mit alter App-ID
  erhalten kein Auto-Update; einmalige Neuinstallation nötig. Wird im
  Release-Text von `android-v0.4.0` deutlich vermerkt.
- Backend ist noch nicht produktiv — keine Datenmigration nötig.
- Web-Nutzerdaten werden über den localStorage-Shim erhalten.
- Nichts wird gelöscht: alte GitHub-Repos nur archiviert, lokale Ordner
  bleiben bis zur Bestätigung bestehen.

## Erfolgs-Kriterien

1. `0xGI0/stoa` enthält die vollständige History aller drei Teilprojekte
   in `web/`, `android/`, `backend/`; `git log --follow` funktioniert über
   die Umbenennung hinweg.
2. Web-App deployt über Vercel aus `web/` und zeigt überall „Stoa".
3. `./gradlew assembleRelease` in `android/` baut eine als
   `io.github.oxgi0.stoa` signierte APK, Version 0.4.0.
4. Backend-Tests grün, CORS zeigt auf die neue Web-URL.
5. Alle CI-Workflows laufen pfad-gefiltert grün; Release-Pipeline erzeugt
   bei Tag `android-v0.4.0` alle Artefakte wie bisher.
6. Alte Repos archiviert mit Verweis auf `stoa`.
