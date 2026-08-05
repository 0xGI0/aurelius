<p align="center">
  <img src="docs/logo.png" width="140" alt="Aurelius-Logo: Lorbeerkranz mit A">
</p>
<h1 align="center">Aurelius</h1>
<p align="center">
  <a href="#deutsch">Deutsch</a> · <a href="#english">English</a>
</p>
<p align="center">
  <img src="app/src/main/res/drawable/marcus_portrait.jpg" width="240" alt="Büste des Marc Aurel (Glyptothek München)">
</p>

---

## Deutsch

Native Android-App für Marc Aurels *Selbstbetrachtungen* — alle **486 Abschnitte**
auf Deutsch, Englisch und Altgriechisch, mit Themen-Filtern, Favoriten
(lokal oder per Konto geräteübergreifend synchronisiert) und optionalen
KI-Erklärungen. Vollständig offline nutzbar, keine Werbung, kein Tracking.

Kotlin + Jetpack Compose · minSdk 26 (Android 8.0) · Lizenz **GPL-3.0-or-later**

**Schwester-Projekte:** [aurelius](https://github.com/0xGI0/aurelius) (Web-App) ·
[aurelius-backend](https://github.com/0xGI0/aurelius-backend) (Konto- & Sync-Server)

### Installation

Aktuelle APK von den [Releases](https://github.com/0xGI0/aurelius-android/releases)
laden und öffnen („Unbekannte Quellen" einmalig erlauben). F-Droid-Aufnahme ist
in Vorbereitung.

**Download prüfen (optional, empfohlen):**

    sha256sum -c SHA256SUMS.txt                      # Prüfsumme
    gh attestation verify aurelius-*.apk \
      --repo 0xGI0/aurelius-android                  # Sigstore-Build-Nachweis

Die Attestierung beweist, dass die APK von der öffentlichen GitHub-Actions-
Pipeline aus genau diesem Quellcode gebaut wurde.

### Selbst bauen

    export JAVA_HOME=~/.jdks/temurin-21   # JDK 17+
    ./gradlew assembleDebug               # braucht Android-SDK (local.properties)
    ./gradlew test                        # JVM-Testsuite

Debug-Builds sprechen das Backend unter `http://10.0.2.2:8000` an (lokaler
Server, vom Emulator aus). Release-Signatur läuft über die Env-Vars
`AURELIUS_KEYSTORE` / `AURELIUS_KEYSTORE_PASS`; ohne sie entsteht ein
unsigniertes APK (so baut auch F-Droid).

### Quellen & Lizenzen der Inhalte

- Deutsch: Albert Wittstock (1879, gemeinfrei) · Englisch: George Long (1862, gemeinfrei)
- Altgriechisch: Perseus Digital Library, PerseusDL canonical-greekLit, **CC BY-SA 4.0**
- Büste/Porträt: Glyptothek München, Foto Bibi Saint-Pol (gemeinfrei)
- Schriften: Fraunces & GFS Didot (SIL Open Font License, siehe `licenses/`)

---

## English

Native Android app for Marcus Aurelius' *Meditations* — all **486 sections**
in German, English and Ancient Greek, with topic filters, favorites (local,
or synced across devices with a free account) and optional AI explanations.
Fully usable offline, no ads, no tracking.

Kotlin + Jetpack Compose · minSdk 26 (Android 8.0) · License **GPL-3.0-or-later**

**Sister projects:** [aurelius](https://github.com/0xGI0/aurelius) (web app) ·
[aurelius-backend](https://github.com/0xGI0/aurelius-backend) (account & sync server)

### Install

Grab the latest APK from the [Releases](https://github.com/0xGI0/aurelius-android/releases)
page and open it (allow "unknown sources" once). F-Droid inclusion is in
preparation.

**Verify your download (optional, recommended):**

    sha256sum -c SHA256SUMS.txt                      # checksum
    gh attestation verify aurelius-*.apk \
      --repo 0xGI0/aurelius-android                  # Sigstore build provenance

The attestation proves the APK was built by the public GitHub Actions
pipeline from exactly this source code.

### Build it yourself

    export JAVA_HOME=~/.jdks/temurin-21   # JDK 17+
    ./gradlew assembleDebug               # needs the Android SDK (local.properties)
    ./gradlew test                        # JVM test suite

Debug builds talk to the backend at `http://10.0.2.2:8000` (local server,
from the emulator). Release signing uses the env vars `AURELIUS_KEYSTORE` /
`AURELIUS_KEYSTORE_PASS`; without them the build is unsigned (which is how
F-Droid builds it).

### Content sources & licenses

- German: Albert Wittstock (1879, public domain) · English: George Long (1862, public domain)
- Ancient Greek: Perseus Digital Library, PerseusDL canonical-greekLit, **CC BY-SA 4.0**
- Bust/portrait: Glyptothek Munich, photo Bibi Saint-Pol (public domain)
- Fonts: Fraunces & GFS Didot (SIL Open Font License, see `licenses/`)
