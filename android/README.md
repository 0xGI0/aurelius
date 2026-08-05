# Aurelius (Android)

Native Android-App für Marc Aurels *Selbstbetrachtungen* — alle 486 Abschnitte
auf Deutsch, Englisch und Altgriechisch, mit Themen-Filtern, Favoriten
(lokal oder per Konto synchronisiert) und optionalen KI-Erklärungen.

Kotlin + Jetpack Compose · minSdk 26 · keine Google-Dienste, kein Tracking.

**Schwester-Projekte:** [aurelius](../../../aurelius) (Expo-Web-App) ·
[aurelius-backend](../../../aurelius-backend) (Django-API für Konten & Sync)

## Bauen

    export JAVA_HOME=~/.jdks/temurin-21   # JDK 17+
    ./gradlew assembleDebug               # braucht Android-SDK (local.properties)
    ./gradlew test                        # 39 JVM-Tests

Debug-Builds sprechen das Backend auf `http://10.0.2.2:8000` an
(lokaler Django-Server vom Emulator aus). Die Release-Server-URL wird
beim Go-Live gesetzt (`BACKEND_URL` in app/build.gradle.kts).

## Quellen & Lizenzen der Inhalte

- Deutsch: Albert Wittstock (1879, gemeinfrei)
- Englisch: George Long (1862, gemeinfrei)
- Altgriechisch: Perseus Digital Library, PerseusDL canonical-greekLit, **CC BY-SA 4.0**
- Büste/Porträt: Glyptothek München, Foto Bibi Saint-Pol (gemeinfrei)
- Schriften: Fraunces & GFS Didot (SIL Open Font License, siehe `licenses/`)
