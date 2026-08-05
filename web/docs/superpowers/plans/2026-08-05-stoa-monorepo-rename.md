# Stoa Monorepo-Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** „Aurelius" (Web, Android, Backend) wird zu **Stoa** umbenannt und in ein Monorepo `0xGI0/stoa` mit vollständiger Git-History zusammengeführt.

**Architecture:** Das bestehende GitHub-Repo `0xGI0/aurelius` wird zu `stoa` umbenannt (erhält Redirects/Issues/Vercel-Link). Die Historien aller drei Repos werden mit `git filter-repo` in die Unterordner `web/`, `android/`, `backend/` umgeschrieben und lokal zusammengemergt, dann force-gepusht. CI läuft pfad-gefiltert, Android-Releases über Tags `android-v*`.

**Tech Stack:** git filter-repo, gh CLI, Expo/React Native (web), Kotlin/Gradle (android), Django (backend), GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-05-stoa-monorepo-rename-design.md`

## Global Constraints

- Neuer Produktname überall: **Stoa** (Anzeige), Slug/Scheme: **stoa**
- Android: `applicationId` und `namespace` = **`io.github.oxgi0.stoa`**, `versionName` = **"0.4.0"**, `versionCode` = **5**
- Tag-Schema künftig: **`android-v*`** (bestehende Tags `v0.1.0`–`v0.3.0` werden zu `android-v0.1.0`–`android-v0.3.0`)
- Storage-Keys Web: `aurelius.*` → `stoa.*` mit einmaligem Migrations-Shim (kein Datenverlust)
- **Nicht umbenennen:** Autor-Nennungen „Marcus Aurelius"/„Marc Aurel" (Inhalt), Keystore-Alias `aurelius`, Env-Var-/Secret-Namen `AURELIUS_KEYSTORE*` (Umbenennung würde Neu-Eingabe aller Secrets erfordern — bewusste Ausnahme, in RELEASING.md dokumentieren)
- **Nichts löschen:** Alte GitHub-Repos nur archivieren; lokale Ordner `aurelius*` bleiben bis zur Endabnahme liegen
- Sandbox-Hinweise für diese Maschine: `git commit` (GPG-Agent), `npm`/`pip` (Netz/Cache) und `gh` (Netz) brauchen Sandbox-Bypass
- Reihenfolge-kritisch: Vercel Root Directory **vor** dem Force-Push auf `web` stellen
- Logo (Lorbeerkranz mit „A") bleibt vorerst — Redesign ist explizit **Nicht-Ziel** dieses Plans (Follow-up)

---

### Task 1: Werkzeuge & Vorbedingungen

**Files:**
- Keine Repo-Dateien; nur Tooling und Zustandsprüfung.

**Interfaces:**
- Produces: funktionierendes `git filter-repo`; Bestätigung, dass alle drei Repos clean und auf `main` sind.

- [ ] **Step 1: git-filter-repo installieren** (Bypass nötig, Fedora ist PEP-668-managed)

```bash
python3 -m pip install --user --break-system-packages git-filter-repo
```

Fallback, falls pip scheitert: `sudo dnf install git-filter-repo`

- [ ] **Step 2: Installation prüfen**

Run: `git filter-repo --version`
Expected: Versions-Hash, kein „kein Git-Befehl"

- [ ] **Step 3: Repos clean & auf main?**

```bash
cd /home/x/Dokumente/Github
for r in aurelius aurelius-android aurelius-backend; do
  echo "== $r =="; git -C $r status --porcelain; git -C $r branch --show-current
done
```

Expected: keine Ausgabe von `status --porcelain`, Branch überall `main`. Falls nicht: abbrechen und klären.

---

### Task 2: Historien umschreiben und zu `stoa` zusammenführen

**Files:**
- Create: `/home/x/Dokumente/Github/.stoa-migration/` (Arbeitsverzeichnis, temporär)
- Create: `/home/x/Dokumente/Github/stoa/` (das neue Monorepo)

**Interfaces:**
- Consumes: die drei lokalen Repos (Task 1: clean)
- Produces: lokales Repo `stoa` mit `web/`, `android/`, `backend/`, Tags `android-v0.1.0`–`android-v0.3.0`, ohne Remotes. Alle Folge-Tasks arbeiten in `/home/x/Dokumente/Github/stoa`.

- [ ] **Step 1: Frische Klone erstellen** (`file://` erzwingt echte Klone — Voraussetzung für filter-repo)

```bash
mkdir /home/x/Dokumente/Github/.stoa-migration && cd /home/x/Dokumente/Github/.stoa-migration
git clone file:///home/x/Dokumente/Github/aurelius web-rw
git clone file:///home/x/Dokumente/Github/aurelius-android android-rw
git clone file:///home/x/Dokumente/Github/aurelius-backend backend-rw
```

- [ ] **Step 2: Historien in Unterordner umschreiben**

```bash
cd web-rw     && git filter-repo --to-subdirectory-filter web
cd ../android-rw && git filter-repo --to-subdirectory-filter android --tag-rename v:android-v
cd ../backend-rw && git filter-repo --to-subdirectory-filter backend
```

- [ ] **Step 3: Umschreibung prüfen**

```bash
ls web-rw/web android-rw/android backend-rw/backend >/dev/null && echo STRUKTUR-OK
git -C android-rw tag        # erwartet: android-v0.1.0 … android-v0.3.0
```

- [ ] **Step 4: Monorepo aus web-Basis erzeugen und android/backend hineinmergen**

```bash
cd /home/x/Dokumente/Github
git clone .stoa-migration/web-rw stoa
cd stoa && git remote remove origin
git remote add android ../.stoa-migration/android-rw && git fetch android --tags
git merge --allow-unrelated-histories android/main -m "chore: Android-App ins Monorepo übernommen (android/)"
git remote add backend ../.stoa-migration/backend-rw && git fetch backend
git merge --allow-unrelated-histories backend/main -m "chore: Backend ins Monorepo übernommen (backend/)"
git remote remove android && git remote remove backend
```

(Merge-Commits ohne GPG-Problem? Falls Commit wegen GPG scheitert: Befehl mit Sandbox-Bypass wiederholen.)

- [ ] **Step 5: Ergebnis verifizieren**

```bash
ls            # erwartet: web/ android/ backend/
git tag       # erwartet: android-v0.1.0 android-v0.1.1 android-v0.2.0 android-v0.3.0
git log --follow --oneline -- web/package.json | tail -2   # zeigt früheste Web-Commits → History intakt
git log --oneline | wc -l   # grob: Summe der Einzel-Historien + 2 Merges
```

---

### Task 3: Root-Dateien konsolidieren (README, SECURITY, LICENSE, Dependabot)

**Files:**
- Create: `README.md`, `SECURITY.md`, `.github/dependabot.yml` (Root)
- Move: `android/LICENSE` → Kopie nach `LICENSE` (Root), `web/.github/workflows/scorecard.yml` → `.github/workflows/scorecard.yml`
- Delete: `web/.github/`, `android/.github/`, `backend/.github/` (komplett — Workflows in Unterordnern sind bei GitHub wirkungslos)

**Interfaces:**
- Consumes: Monorepo aus Task 2 (Arbeitsverzeichnis `/home/x/Dokumente/Github/stoa`)
- Produces: genau ein `.github/` am Root; `scorecard.yml` unverändert übernommen. Task 4 legt daneben die CI-Workflows an.

- [ ] **Step 1: Root-README schreiben** — `README.md`:

```markdown
<p align="center">
  <img src="web/docs/logo.png" width="140" alt="Stoa-Logo: Lorbeerkranz">
</p>

# Stoa

Die drei großen Stoiker — Marc Aurel, Epiktet, Seneca — als App:
Originaltexte, neue Übersetzungen, Favoriten und KI-Erklärungen.

| Teilprojekt | Verzeichnis | Stack |
|---|---|---|
| Web-App (PWA) | [`web/`](web/) | Expo / React Native Web, Vercel |
| Android-App | [`android/`](android/) | Kotlin, Jetpack Compose |
| Backend | [`backend/`](backend/) | Django (Konten & Favoriten-Sync) |

Details, Build- und Release-Anleitungen stehen in den READMEs der
Teilprojekte. Sicherheitshinweise: [SECURITY.md](SECURITY.md).

> Bis August 2026 hieß dieses Projekt **Aurelius** und lebte in drei
> getrennten Repos (`aurelius`, `aurelius-android`, `aurelius-backend`).
> Die vollständige History aller drei ist in dieses Monorepo übernommen.
```

- [ ] **Step 2: SECURITY.md konsolidieren**

Basis ist `web/SECURITY.md`. Eine Root-`SECURITY.md` erstellen, die (a) den Abschnitt zu privater Schwachstellen-Meldung (GitHub Private Vulnerability Reporting) und unterstützten Versionen aus der Web-Fassung übernimmt, (b) aus `android/SECURITY.md` den Abschnitt zu Release-Integrität (Keystore-Signatur, SHA256SUMS, Sigstore-Attestation, PGP, CycloneDX-SBOM) einfügt, (c) alle Repo-Verweise auf `0xGI0/stoa` umstellt. Danach die drei alten Dateien löschen:

```bash
git rm web/SECURITY.md android/SECURITY.md backend/SECURITY.md
```

- [ ] **Step 3: LICENSE an den Root kopieren, Scorecard verschieben, alte .github entfernen**

```bash
cp android/LICENSE LICENSE && git add LICENSE
mkdir -p .github/workflows
git mv web/.github/workflows/scorecard.yml .github/workflows/scorecard.yml
git rm -r web/.github android/.github backend/.github
```

- [ ] **Step 4: Dependabot-Config am Root** — `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /web
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    groups:
      expo:
        patterns:
          - "expo*"
          - "@expo/*"
          - "@expo-google-fonts/*"
          - "react-native*"
  - package-ecosystem: gradle
    directory: /android
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
  - package-ecosystem: pip
    directory: /backend
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: Root-Struktur fürs Monorepo (README, SECURITY, LICENSE, Dependabot)"
```

---

### Task 4: CI- und Release-Workflows mit Pfad-Filtern

**Files:**
- Create: `.github/workflows/web-ci.yml`, `.github/workflows/android-ci.yml`, `.github/workflows/backend-ci.yml`, `.github/workflows/android-release.yml`

**Interfaces:**
- Consumes: Root-`.github/` aus Task 3
- Produces: vier Workflows. `android-release.yml` triggert auf Tags `android-v*` und erzeugt Assets `stoa-v<X>.apk` / `stoa-v<X>-sbom.cdx.json` (Task 10 verlässt sich auf diese Namen).

- [ ] **Step 1: `web-ci.yml`** — Inhalt der bisherigen Web-CI, plus Pfad-Filter, `working-directory` und `cache-dependency-path`:

```yaml
name: Web CI

on:
  push:
    branches: [main]
    paths: ["web/**", ".github/workflows/web-ci.yml"]
  pull_request:
    paths: ["web/**", ".github/workflows/web-ci.yml"]

permissions:
  contents: read

defaults:
  run:
    working-directory: web

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
      - uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: web/package-lock.json
      - name: Abhängigkeiten installieren
        run: npm ci
      - name: TypeScript prüfen
        run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: ["20", "22"]
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
      - uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
          cache-dependency-path: web/package-lock.json
      - name: Abhängigkeiten installieren
        run: npm ci
      - name: Tests ausführen
        run: npm test -- --ci

  web-export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
      - uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: web/package-lock.json
      - name: Abhängigkeiten installieren
        run: npm ci
      # Smoke-Test: Der statische Web-Export muss ohne Fehler durchlaufen —
      # genau der Build, den Vercel in Produktion ausführt.
      - name: Expo-Web-Export bauen
        run: npx expo export -p web

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
      - uses: actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38 # v6
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: web/package-lock.json
      - name: Abhängigkeiten installieren
        run: npm ci
      # Gate nur auf high/critical in Produktions-Abhängigkeiten; die
      # moderate-Advisories des Expo-Templates blockieren den Build nicht.
      - name: npm audit (bekannte CVEs in Abhängigkeiten)
        run: npm audit --omit=dev --audit-level=high
      - name: Lockfile-Integrität prüfen
        run: npm ci --dry-run
```

- [ ] **Step 2: `android-ci.yml`**

```yaml
name: Android CI

on:
  push:
    branches: [main]
    paths: ["android/**", ".github/workflows/android-ci.yml"]
  pull_request:
    paths: ["android/**", ".github/workflows/android-ci.yml"]

permissions:
  contents: read

defaults:
  run:
    working-directory: android

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-java@v5
        with:
          distribution: temurin
          java-version: "21"
      - name: JVM-Tests
        run: ./gradlew test --no-daemon --console=plain
      - name: Debug-Build
        run: ./gradlew assembleDebug --no-daemon --console=plain
```

- [ ] **Step 3: `backend-ci.yml`**

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths: ["backend/**", ".github/workflows/backend-ci.yml"]
  pull_request:
    paths: ["backend/**", ".github/workflows/backend-ci.yml"]

permissions:
  contents: read

defaults:
  run:
    working-directory: backend

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v6
        with:
          python-version: "3.13"
      - name: Abhängigkeiten installieren
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Django-Testsuite
        run: python manage.py test --verbosity 2
```

- [ ] **Step 4: `android-release.yml`** — wie die bisherige Release-Pipeline, mit Tag-Präfix, `working-directory` und Stoa-Asset-Namen. `uses:`-Schritte (Attestation, Release) sehen Pfade relativ zum Workspace-Root, daher dort `android/dist/…`:

```yaml
name: Android Release

on:
  push:
    tags: ["android-v*"]

permissions:
  contents: read

defaults:
  run:
    working-directory: android

jobs:
  release:
    runs-on: ubuntu-latest
    # id-token + attestations für die Sigstore-Build-Attestierung
    permissions:
      contents: write
      id-token: write
      attestations: write
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-java@v5
        with:
          distribution: temurin
          java-version: "21"
      - name: Tests
        run: ./gradlew test --no-daemon --console=plain
      - name: Keystore aus Secret wiederherstellen
        env:
          KEYSTORE_B64: ${{ secrets.AURELIUS_KEYSTORE_B64 }}
        run: echo "$KEYSTORE_B64" | base64 -d > "$RUNNER_TEMP/release.keystore"
      - name: Signiertes Release-APK bauen
        env:
          AURELIUS_KEYSTORE: ${{ runner.temp }}/release.keystore
          AURELIUS_KEYSTORE_PASS: ${{ secrets.AURELIUS_KEYSTORE_PASS }}
        run: ./gradlew assembleRelease --no-daemon --console=plain
      # Tag android-v0.4.0 → Assets stoa-v0.4.0.*
      - name: APK benennen
        run: |
          VERSION="${GITHUB_REF_NAME#android-}"
          mkdir dist
          cp app/build/outputs/apk/release/app-release.apk \
            "dist/stoa-${VERSION}.apk"
      # SBOM aus den Release-Laufzeitabhängigkeiten — läuft in SHA256SUMS,
      # Attestierung und Release mit
      - name: SBOM erzeugen (CycloneDX)
        run: |
          VERSION="${GITHUB_REF_NAME#android-}"
          ./gradlew :app:cyclonedxBom --no-daemon --console=plain
          cp app/build/reports/bom.cdx.json \
            "dist/stoa-${VERSION}-sbom.cdx.json"
      # Checksums-Notiz landet außerhalb von dist/, damit sie kein Asset wird
      - name: SHA256SUMS erzeugen
        run: |
          cd dist
          sha256sum * > SHA256SUMS.txt
          {
            echo "## Checksums"
            echo
            echo '```'
            cat SHA256SUMS.txt
            echo '```'
            echo
            echo 'Build-Nachweis prüfen: `gh attestation verify <apk> --repo ${{ github.repository }}`'
          } > "$RUNNER_TEMP/checksums.md"
      - name: Build-Provenance attestieren
        uses: actions/attest-build-provenance@v4
        with:
          subject-path: |
            android/dist/*.apk
            android/dist/*.cdx.json
      - name: GitHub-Release erstellen
        uses: softprops/action-gh-release@v3
        with:
          files: android/dist/*
          body_path: ${{ runner.temp }}/checksums.md
          generate_release_notes: true
```

- [ ] **Step 5: YAML-Syntax prüfen und committen**

```bash
for f in .github/workflows/*.yml; do python3 -c "import yaml,sys; yaml.safe_load(open('$f'))" && echo "OK $f"; done
git add .github/workflows
git commit -m "ci: pfad-gefilterte Workflows fürs Monorepo, Release auf android-v*-Tags"
```

---

### Task 5: Web-Rename + Storage-Migrations-Shim (TDD)

**Files:**
- Modify: `web/app.json` (Zeilen 3, 4, 8), `web/package.json:2`, `web/README.md`
- Create: `web/lib/storage-migration.ts`
- Test: `web/lib/__tests__/storage-migration.test.ts`
- Modify: `web/app/_layout.tsx` (Aufruf des Shims), alle `K_*`-Konstanten in `web/lib/api.ts`, `web/lib/favorites.ts`, `web/lib/settings.ts`, `web/lib/i18n.ts`

**Interfaces:**
- Consumes: `getItem/setItem/deleteItem` aus `web/lib/storage.ts` (bestehend)
- Produces: `migrateLegacyStorage(): Promise<void>` aus `web/lib/storage-migration.ts`; alle Storage-Keys heißen `stoa.*`

- [ ] **Step 1: Failing Test schreiben** — `web/lib/__tests__/storage-migration.test.ts` (Mock-Muster wie in `settings.test.ts`):

```ts
const mockStore = new Map<string, string>();
jest.mock('../storage', () => ({
  getItem: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  deleteItem: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

import { migrateLegacyStorage } from '../storage-migration';

beforeEach(() => mockStore.clear());

describe('migrateLegacyStorage', () => {
  it('kopiert alte aurelius.*-Keys nach stoa.* und löscht die alten', async () => {
    mockStore.set('aurelius.favorites', '["m-1-1"]');
    mockStore.set('aurelius.theme', 'dark');
    await migrateLegacyStorage();
    expect(mockStore.get('stoa.favorites')).toBe('["m-1-1"]');
    expect(mockStore.get('stoa.theme')).toBe('dark');
    expect(mockStore.has('aurelius.favorites')).toBe(false);
  });

  it('überschreibt vorhandene stoa.*-Werte nicht', async () => {
    mockStore.set('aurelius.theme', 'dark');
    mockStore.set('stoa.theme', 'light');
    await migrateLegacyStorage();
    expect(mockStore.get('stoa.theme')).toBe('light');
  });

  it('ist ohne Alt-Daten ein No-op', async () => {
    await expect(migrateLegacyStorage()).resolves.toBeUndefined();
    expect(mockStore.size).toBe(0);
  });
});
```

- [ ] **Step 2: Test rot sehen**

Run: `cd /home/x/Dokumente/Github/stoa/web && npm ci && npx jest lib/__tests__/storage-migration.test.ts` (npm mit Bypass)
Expected: FAIL — Modul `../storage-migration` existiert nicht

- [ ] **Step 3: Shim implementieren** — `web/lib/storage-migration.ts`:

```ts
import { getItem, setItem, deleteItem } from './storage';

// Alle Storage-Keys aus der Aurelius-Zeit (Stand v0.3.0). Der Shim läuft
// bei jedem App-Start; nach der ersten Migration ist er ein No-op.
const LEGACY_KEYS = [
  'token', 'email',            // lib/api.ts
  'favorites', 'pendingOps',   // lib/favorites.ts
  'quoteLang', 'theme', 'anthropicKey', 'author', // lib/settings.ts
  'uiLang',                    // lib/i18n.ts
];

export async function migrateLegacyStorage(): Promise<void> {
  for (const suffix of LEGACY_KEYS) {
    const legacy = await getItem(`aurelius.${suffix}`);
    if (legacy === null) continue;
    if ((await getItem(`stoa.${suffix}`)) === null) {
      await setItem(`stoa.${suffix}`, legacy);
    }
    await deleteItem(`aurelius.${suffix}`);
  }
}
```

- [ ] **Step 4: Test grün sehen**

Run: `npx jest lib/__tests__/storage-migration.test.ts`
Expected: PASS (3 Tests)

- [ ] **Step 5: Keys umstellen** — in `web/lib/api.ts`, `favorites.ts`, `settings.ts`, `i18n.ts` alle `K_*`-Konstanten von `'aurelius.…'` auf `'stoa.…'`:

```bash
sed -i "s/'aurelius\./'stoa./g" lib/api.ts lib/favorites.ts lib/settings.ts lib/i18n.ts
grep -rn "'aurelius\." lib/   # erwartet: keine Treffer
```

- [ ] **Step 6: Shim beim App-Start aufrufen** — in `web/app/_layout.tsx` in das bestehende Lade-Gate einhängen (das Layout wartet bereits auf Fonts o. Ä.; Muster im File übernehmen):

```tsx
import { useEffect, useState } from 'react';
import { migrateLegacyStorage } from '../lib/storage-migration';

// im Root-Layout-Component:
const [storageReady, setStorageReady] = useState(false);
useEffect(() => { migrateLegacyStorage().finally(() => setStorageReady(true)); }, []);
// bestehende Bedingung erweitern: erst rendern, wenn Fonts UND storageReady
if (!storageReady) return null;
```

- [ ] **Step 7: Produktname** — `web/app.json`: `"name": "Stoa"`, `"slug": "stoa"`, `"scheme": "stoa"`; `web/package.json`: `"name": "stoa"`; danach Lockfile nachziehen:

```bash
npm install --package-lock-only
```

`web/README.md`: Titel „Aurelius" → „Stoa", Logo-Alt-Text „Stoa-Logo: Lorbeerkranz", Repo-Links auf `0xGI0/stoa`.

- [ ] **Step 8: Gesamte Web-Suite grün sehen**

Run: `npx tsc --noEmit && npm test -- --ci`
Expected: PASS, keine Typfehler

- [ ] **Step 9: Commit**

```bash
cd /home/x/Dokumente/Github/stoa
git add web
git commit -m "feat(web)!: Umbenennung in Stoa, Storage-Keys migriert (stoa.*)"
```

---

### Task 6: Android-Rename (App-ID, Packages, 0.4.0)

**Files:**
- Modify: `android/app/build.gradle.kts` (namespace, applicationId, versionCode/-Name, EXPLAIN_URL-Kommentar), `android/settings.gradle.kts` (rootProject.name), `android/app/src/main/res/values*/strings.xml` (app_name), `android/fastlane/metadata/android/{de-DE,en-US}/*.txt`, `android/RELEASING.md`, `android/README.md`
- Move: `android/app/src/{main,test}/java/io/github/oxgi0/aurelius/` → `…/stoa/`

**Interfaces:**
- Consumes: Monorepo-Stand aus Task 5
- Produces: Paket `io.github.oxgi0.stoa`, `versionName "0.4.0"`, `versionCode 5`. Die `EXPLAIN_URL`-Domain wird erst in Task 8 final gesetzt (Vercel-Domain dann bekannt).

- [ ] **Step 1: local.properties übernehmen** (gitignored, fehlt im neuen Klon)

```bash
cp /home/x/Dokumente/Github/aurelius-android/local.properties /home/x/Dokumente/Github/stoa/android/local.properties
```

- [ ] **Step 2: Package-Verzeichnisse verschieben**

```bash
cd /home/x/Dokumente/Github/stoa/android
git mv app/src/main/java/io/github/oxgi0/aurelius app/src/main/java/io/github/oxgi0/stoa
git mv app/src/test/java/io/github/oxgi0/aurelius app/src/test/java/io/github/oxgi0/stoa
```

- [ ] **Step 3: Alle Paket-Referenzen umschreiben** (package-Deklarationen, Imports, namespace, applicationId)

```bash
grep -rl 'io\.github\.oxgi0\.aurelius' . | xargs sed -i 's/io\.github\.oxgi0\.aurelius/io.github.oxgi0.stoa/g'
grep -rn 'io\.github\.oxgi0\.aurelius' .   # erwartet: keine Treffer
```

- [ ] **Step 4: Version und Namen setzen** — `android/app/build.gradle.kts`:

```kotlin
versionCode = 5
versionName = "0.4.0"
```

Keystore-Block bleibt unverändert (Alias `aurelius`, Env-Vars `AURELIUS_KEYSTORE*` — siehe Global Constraints). `settings.gradle.kts`: `rootProject.name = "stoa-android"`. In `strings.xml` (alle values-Ordner): `<string name="app_name">Stoa</string>`.

- [ ] **Step 5: Fastlane-Metadata** — `title.txt` (de-DE und en-US) → `Stoa`. In `short_description.txt`/`full_description.txt` nur den *Produktnamen* „Aurelius" durch „Stoa" ersetzen; Autor-Nennungen (Marc Aurel/Marcus Aurelius) bleiben. Beide Dateien danach einmal ganz durchlesen.

- [ ] **Step 6: RELEASING.md aktualisieren** — Tag-Schema `android-v*` statt `v*`, Repo `0xGI0/stoa`, Asset-Namen `stoa-v<X>.*`, plus Hinweis: „Secret-/Env-Namen behalten das AURELIUS_-Präfix (historisch, Keystore-Kontinuität)." `README.md`: Titel/Links wie in Task 5 Step 7.

- [ ] **Step 7: Build & Tests grün sehen**

Run: `./gradlew test assembleDebug --no-daemon --console=plain` (ggf. Bypass für Dependency-Downloads)
Expected: BUILD SUCCESSFUL; `app/build/outputs/apk/debug/app-debug.apk` existiert

- [ ] **Step 8: applicationId im Artefakt prüfen**

```bash
grep -m1 applicationId app/build.gradle.kts   # io.github.oxgi0.stoa
```

- [ ] **Step 9: Commit**

```bash
cd /home/x/Dokumente/Github/stoa
git add android
git commit -m "feat(android)!: App-ID io.github.oxgi0.stoa, Version 0.4.0"
```

---

### Task 7: Backend-Rename

**Files:**
- Modify: `backend/config/settings.py` (Zeilen ~161–175: E-Mail-Prefix, DEFAULT_FROM_EMAIL; CORS folgt in Task 8), `backend/README.md`

**Interfaces:**
- Consumes: Monorepo-Stand aus Task 6
- Produces: Backend-Branding „Stoa"; CORS-Domain wird in Task 8 gesetzt

- [ ] **Step 1: settings.py anpassen**

```python
ACCOUNT_EMAIL_SUBJECT_PREFIX = "[Stoa] "
DEFAULT_FROM_EMAIL = "stoa@localhost"
```

Der CORS-Eintrag `https://die-stoa.vercel.app` bleibt vorerst — er wird in Task 8 Step 4 durch die echte neue Domain ersetzt (vorher unbekannt).

- [ ] **Step 2: README.md** — Titel/Logo-Alt/Links auf Stoa bzw. `0xGI0/stoa` umstellen.

- [ ] **Step 3: Tests grün sehen**

```bash
cd /home/x/Dokumente/Github/stoa/backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # Bypass nötig
.venv/bin/python manage.py test --verbosity 2
```

Expected: alle Tests PASS

- [ ] **Step 4: Commit**

```bash
cd /home/x/Dokumente/Github/stoa
git add backend
git commit -m "feat(backend): Branding auf Stoa umgestellt"
```

---

### Task 8: GitHub-Rename, Vercel-Umstellung, Force-Push, Secrets

**Files:**
- Modify: `android/app/build.gradle.kts` (EXPLAIN_URL), `backend/config/settings.py` (CORS) — mit der echten Vercel-Domain
- Extern: GitHub-Repo-Rename, Vercel-Projekt, GitHub-Secrets

**Interfaces:**
- Consumes: fertiges lokales Monorepo (Tasks 2–7), Keystore unter `~/aurelius-signing/aurelius-release.keystore`
- Produces: `github.com/0xGI0/stoa` mit Monorepo-History, laufender CI, Vercel-Deploy aus `web/`, Secrets `AURELIUS_KEYSTORE_B64`/`AURELIUS_KEYSTORE_PASS` im neuen Repo

- [ ] **Step 1: GitHub-Repo umbenennen** (gh mit Bypass; falls Auth klemmt: im Browser Settings → Rename)

```bash
gh repo rename stoa --repo 0xGI0/aurelius --yes
gh repo view 0xGI0/stoa --json name,url   # Bestätigung
```

- [ ] **Step 2: Branch-Protection prüfen** (würde Force-Push blocken)

```bash
gh api repos/0xGI0/stoa/branches/main/protection || echo "keine Protection - OK"
```

Falls Protection existiert: temporär deaktivieren, nach Step 5 wieder aktivieren.

- [ ] **Step 3: USER ACTION — Vercel-Dashboard** (vor dem Push!)
  1. Projekt öffnen → Settings → General → **Project Name: `stoa`** → Save
  2. Settings → Build & Deployment → **Root Directory: `web`** → Save
  3. Unter „Domains" die neue Produktions-Domain ablesen (z. B. `stoa-xyz.vercel.app`) und für Step 4 notieren
  4. Optional, empfohlen: Settings → Git → „Ignored Build Step" auf `git diff --quiet HEAD^ HEAD -- ./` stellen (relativ zum Root Directory `web`), damit reine Android-/Backend-Pushes keine Leer-Deploys auslösen

- [ ] **Step 4: Echte Domain einsetzen** (`<DOMAIN>` = abgelesene Domain aus Step 3)

```bash
cd /home/x/Dokumente/Github/stoa
sed -i 's|aurelius-rust\.vercel\.app|<DOMAIN>|' android/app/build.gradle.kts backend/config/settings.py
grep -rn "aurelius-rust" . && echo "NOCH TREFFER - prüfen" || echo OK
git add -u && git commit -m "chore: neue Vercel-Domain in EXPLAIN_URL und CORS"
```

- [ ] **Step 5: Force-Push von History und Tags**

```bash
git remote add origin https://github.com/0xGI0/stoa.git
git push --force -u origin main
git push origin --tags
```

- [ ] **Step 6: Android-Signing-Secrets ins neue Repo** (lagen bisher in `aurelius-android`, wandern nicht mit)

```bash
base64 -w0 ~/aurelius-signing/aurelius-release.keystore | gh secret set AURELIUS_KEYSTORE_B64 -R 0xGI0/stoa
gh secret set AURELIUS_KEYSTORE_PASS -R 0xGI0/stoa   # Passwort interaktiv (aus dem Passwortmanager)
gh secret list -R 0xGI0/stoa   # beide sichtbar?
```

- [ ] **Step 7: CI und Vercel verifizieren**

```bash
gh run list -R 0xGI0/stoa --limit 5   # web-ci/android-ci/backend-ci laufen bzw. grün
gh run watch -R 0xGI0/stoa
curl -s https://<DOMAIN>/ | grep -o "<title>[^<]*"   # erwartet: Stoa
```

---

### Task 9: Alt-Repos stilllegen

**Files:**
- Modify: `README.md` in `aurelius-android` und `aurelius-backend` (Hinweis-Banner)
- Extern: Archivierung beider Repos

**Interfaces:**
- Consumes: funktionierendes `0xGI0/stoa` (Task 8 verifiziert)
- Produces: beide Alt-Repos read-only mit Verweis; v0.3.0-Release bleibt einsehbar

- [ ] **Step 1: Hinweis in beide READMEs** (jeweils ganz oben einfügen, in `aurelius-android` und `aurelius-backend`):

```markdown
> **⚠️ Umgezogen:** Dieses Projekt heißt jetzt **Stoa** und lebt im Monorepo
> [`0xGI0/stoa`](https://github.com/0xGI0/stoa) — mit vollständiger History
> dieses Repos. Hier passiert nichts mehr; die bisherigen Releases bleiben
> zur Verifikation alter Installationen erhalten.
```

```bash
cd /home/x/Dokumente/Github/aurelius-android
# README editieren, dann:
git add README.md && git commit -m "docs: Umzugshinweis auf 0xGI0/stoa" && git push
cd ../aurelius-backend
# README editieren, dann:
git add README.md && git commit -m "docs: Umzugshinweis auf 0xGI0/stoa" && git push
```

- [ ] **Step 2: Archivieren**

```bash
gh repo archive 0xGI0/aurelius-android --yes
gh repo archive 0xGI0/aurelius-backend --yes
```

- [ ] **Step 3: Migrations-Arbeitsverzeichnis entfernen** (nur das — die drei alten Projektordner bleiben bis zur Endabnahme)

```bash
rm -rf /home/x/Dokumente/Github/.stoa-migration
```

---

### Task 10: Release android-v0.4.0 und Endabnahme

**Files:**
- Extern: Git-Tag, GitHub-Release, PGP-Signaturen

**Interfaces:**
- Consumes: `android-release.yml` (Task 4), Secrets (Task 8); Assets heißen `stoa-v0.4.0.apk`, `stoa-v0.4.0-sbom.cdx.json`, `SHA256SUMS.txt`
- Produces: erstes Stoa-Release, vollständig signiert/attestiert

- [ ] **Step 1: Tag setzen und pushen**

```bash
cd /home/x/Dokumente/Github/stoa
git tag -a android-v0.4.0 -m "Stoa 0.4.0 — Umbenennung von Aurelius, neue App-ID"
git push origin android-v0.4.0
gh run watch -R 0xGI0/stoa
```

Expected: Release-Workflow grün; Release mit 3 Assets + Checksums-Body

- [ ] **Step 2: Neuinstallations-Hinweis in die Release-Notes** (bestehenden Body ergänzen, nicht ersetzen)

```bash
gh release view android-v0.4.0 -R 0xGI0/stoa --json body -q .body > "$TMPDIR/notes.md"
cat > "$TMPDIR/hint.md" <<'EOF'
> ⚠️ **Aurelius heißt jetzt Stoa.** Die App-ID hat sich geändert
> (`io.github.oxgi0.stoa`) — bestehende Aurelius-Installationen (≤ v0.3.0)
> erhalten dieses Update **nicht** automatisch: bitte einmalig neu
> installieren. Mit Konto synchronisierte Favoriten bleiben erhalten;
> rein lokale Favoriten gehen bei der Neuinstallation verloren.

EOF
cat "$TMPDIR/hint.md" "$TMPDIR/notes.md" > "$TMPDIR/full.md"
gh release edit android-v0.4.0 -R 0xGI0/stoa --notes-file "$TMPDIR/full.md"
```

- [ ] **Step 3: Assets PGP-signieren** (wie bei v0.3.0, vgl. `android/RELEASING.md`)

```bash
mkdir "$TMPDIR/rel" && cd "$TMPDIR/rel"
gh release download android-v0.4.0 -R 0xGI0/stoa
for f in *; do gpg --armor --detach-sign "$f"; done
gh release upload android-v0.4.0 -R 0xGI0/stoa *.asc
```

- [ ] **Step 4: Endabnahme gegen die Spec-Erfolgskriterien**

```bash
cd /home/x/Dokumente/Github/stoa
git log --follow --oneline -- web/package.json | tail -2      # (1) History intakt
curl -s https://<DOMAIN>/ | grep -o "<title>[^<]*"            # (2) Web zeigt Stoa
grep -m1 applicationId android/app/build.gradle.kts            # (3) io.github.oxgi0.stoa
grep -A1 CORS_ALLOWED backend/config/settings.py | head -2     # (4) neue Domain
gh run list -R 0xGI0/stoa --limit 5                            # (5) alles grün
gh repo view 0xGI0/aurelius-android --json isArchived          # (6) archiviert
```

Alle sechs Kriterien erfüllt → dem Nutzer melden; erst nach dessen OK dürfen die lokalen Alt-Ordner (`aurelius`, `aurelius-android`, `aurelius-backend`) manuell entfernt werden (nicht Teil dieses Plans).
