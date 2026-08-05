# Aurelius-Android (Teilprojekt 2) — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Native Kotlin-Android-App mit voller Parität zur Expo-App plus Konto/Favoriten-Sync gegen `aurelius-backend`, F-Droid-tauglich, in neuem Repo `aurelius-android`.

**Architecture:** Single-Module-App, Jetpack Compose + Material 3, manuelle DI über einen `AppContainer` (kein Hilt — weniger Magie, besser zum Lernen). Daten (486 Zitate, 9 Themen) als gebündelte Assets; Favoriten lokal-first in Room mit Sync-Queue; Konto per Token-Auth (Retrofit) gegen das Django-Backend; KI-Erklärungen streamen vom bestehenden Vercel-Endpoint (Gratis-Modus) oder direkt von der Anthropic-API (BYOK).

**Tech Stack:** Kotlin 2.x, AGP 8.13+, Compose BOM + Material3, Navigation-Compose, kotlinx-serialization, Retrofit + OkHttp, Room, DataStore, EncryptedSharedPreferences, MockWebServer/JUnit4 für Tests. JDK: Temurin 21 (lokal installiert, ohne root).

**Spec:** `aurelius/docs/superpowers/specs/2026-08-05-aurelius-backend-kotlin-design.md` §5–§8; Paritäts-Details in diesem Plan (aus vollständiger Code-Erkundung der Expo-App am 2026-08-05).

## Global Constraints

- Arbeitsverzeichnis: `/home/x/Dokumente/Github/aurelius-android` (Task 1 erstellt es).
- **F-Droid-Regeln ab der ersten Zeile:** keine Google-Play-Services, keine proprietären Abhängigkeiten, kein Tracking/Analytics, alle Bibliotheken FOSS (Apache-2/MIT/OFL).
- `applicationId` und Package: `io.github.oxgi0.aurelius` (GitHub-User `0xGI0`; Java-Package-Segmente dürfen nicht mit Ziffer beginnen → `0x`→`ox`).
- minSdk 26, targetSdk/compileSdk 36.
- Toolchain lokal ohne root: JDK nach `~/.jdks/`, Android-SDK nach `~/Android/Sdk` (cmdline-tools + sdkmanager). `ANDROID_HOME` via `local.properties`/Env.
- **Paritäts-Grundsatz:** Verhalten und Werte exakt wie die Expo-App (Farben, Fonts, Texte, Logik — Tabellen in den Tasks). Zwei dokumentierte, bewusste Verbesserungen: (a) Favoriten-Vorschau nutzt die Zitat-Sprache statt hart `de`; (b) bei Stream-Abbruch bleibt der bisherige Erklärtext stehen, Fehler darunter.
- **Kein** „Zitat des Tages" — Home = Zufalls-Shuffle-Bag wie im Original. Tabs (de): Zitat, Bücher, Ausgewählt, Marc Aurel, Stoa.
- i18n: `values/strings.xml` = Deutsch (Default, KEIN Geräte-Locale-Fallback auf en — Parität), `values-en/` = Englisch; die 84 Key-Paare der Expo-App übernehmen (`lib/i18n.ts`), plus neue Konto-Strings.
- Zitat-Quellen-Lizenzhinweis (Perseus CC BY-SA 4.0) muss in den Einstellungen bleiben.
- Backend-URL als `BuildConfig.BACKEND_URL`: Debug `http://10.0.2.2:8000` (Emulator→Host), Release vorerst leer-konfigurierbar (VPS kommt in Teilprojekt 4). Explain-URL: `https://aurelius-rust.vercel.app/api/explain`.
- Tests: reine JVM-Unit-Tests (`./gradlew test`) für Logik/Repos (Fakes + MockWebServer); UI wird per Emulator/Gerät am Ende jeder UI-Task von Hand geprüft (Kommandos stehen im Task).
- Commits deutsch, Conventional Commits. `git commit` braucht Sandbox-Bypass (GPG); große Downloads ggf. auch (Netz).

---

## Datei-Struktur (Endzustand, gekürzt)

```
aurelius-android/
├── settings.gradle.kts · build.gradle.kts · gradle/libs.versions.toml · gradlew
├── LICENSE · README.md · .gitignore
├── fastlane/metadata/android/{de-DE,en-US}/{short_description,full_description}.txt · title.txt
└── app/
    ├── build.gradle.kts
    └── src/
        ├── main/
        │   ├── AndroidManifest.xml
        │   ├── assets/ quotes.json · topics.json
        │   ├── res/ font/{fraunces_medium,fraunces_semibold,gfs_didot}.ttf ·
        │   │        drawable/{marcus_medallion,marcus_portrait}.jpg (als Ressourcen) ·
        │   │        values/strings.xml · values-en/strings.xml · mipmap-*/ (Icons aus aurelius/assets)
        │   └── java/io/github/oxgi0/aurelius/
        │       ├── AureliusApp.kt (Application, AppContainer) · MainActivity.kt
        │       ├── data/ Quote.kt · Topic.kt · QuoteRepository.kt · ShuffleBag.kt · Roman.kt · ReadingList.kt
        │       ├── prefs/ SettingsStore.kt (DataStore) · TokenStore.kt (EncryptedSharedPreferences)
        │       ├── db/ AppDatabase.kt · FavoriteEntity.kt · PendingOpEntity.kt · FavoriteDao.kt
        │       ├── net/ BackendApi.kt (Retrofit) · ExplainClient.kt · AnthropicClient.kt · ApiError.kt
        │       ├── sync/ FavoritesRepository.kt
        │       └── ui/ theme/ (Farben/Typo) · nav/ (Tabs+Routen) · components/ (QuoteCard, Segmented,
        │            TopicChips, FavoriteStar, StreamingText, ExplainSection, Screen) ·
        │            screens/ (QuoteScreen, BooksScreen, BookScreen, ReadScreen, FavoritesScreen,
        │                      AurelScreen, StoaScreen, SettingsScreen, AccountScreen)
        └── test/java/io/github/oxgi0/aurelius/ (JVM-Tests je Baustein)
```

---

### Task 1: Toolchain (JDK 21 + Android-SDK) und Projekt-Gerüst

**Files:**
- Create: `~/.jdks/temurin-21/`, `~/Android/Sdk/` (Toolchain, außerhalb des Repos)
- Create: `aurelius-android/` komplett-Gerüst (settings.gradle.kts, build.gradle.kts, libs.versions.toml, Wrapper, app/build.gradle.kts, Manifest, MainActivity mit „Hello"-Compose, .gitignore)
- Test: `app/src/test/java/io/github/oxgi0/aurelius/SmokeTest.kt`

**Interfaces:**
- Produces: baufähiges Projekt; `./gradlew test` und `./gradlew assembleDebug` laufen durch. Version-Katalog `gradle/libs.versions.toml` mit Aliassen `libs.androidx.*`, `libs.retrofit`, `libs.room.*`, die alle späteren Tasks verwenden.

- [ ] **Step 1: JDK 21 (Temurin) ohne root installieren**

```bash
mkdir -p ~/.jdks && cd ~/.jdks
curl -sL -o temurin21.tar.gz "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse"
tar xf temurin21.tar.gz && rm temurin21.tar.gz && mv jdk-21* temurin-21
~/.jdks/temurin-21/bin/javac -version   # erwartet: javac 21.x
```

- [ ] **Step 2: Android-SDK cmdline-tools installieren**

```bash
mkdir -p ~/Android/Sdk/cmdline-tools && cd ~/Android/Sdk/cmdline-tools
# Aktuelle URL von https://developer.android.com/studio#command-line-tools-only
curl -sL -o tools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
unzip -q tools.zip && rm tools.zip && mv cmdline-tools latest
export JAVA_HOME=~/.jdks/temurin-21 ANDROID_HOME=~/Android/Sdk
yes | ~/Android/Sdk/cmdline-tools/latest/bin/sdkmanager --licenses
~/Android/Sdk/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
```

- [ ] **Step 3: Projekt-Gerüst anlegen** — Repo-Ordner, `.gitignore` (`.gradle/`, `build/`, `local.properties`, `.claude/`, `.mcp.json`, `*.keystore`), `local.properties` mit `sdk.dir=/home/x/Android/Sdk`, Gradle-Wrapper (per `gradle wrapper` aus einer heruntergeladenen Gradle-Distribution oder aus einem `gradle init`), `settings.gradle.kts` (Repos: google(), mavenCentral()), Version-Katalog mit: AGP, Kotlin + compose-plugin + serialization-plugin, compose-bom, activity-compose, navigation-compose, lifecycle-viewmodel-compose, kotlinx-serialization-json, retrofit + converter-kotlinx-serialization, okhttp + mockwebserver, room-runtime/ktx/compiler (+ ksp-Plugin), datastore-preferences, security-crypto, junit4. `app/build.gradle.kts`: `applicationId "io.github.oxgi0.aurelius"`, min 26 / target+compile 36, `buildConfigField("String","BACKEND_URL", …)` (debug `http://10.0.2.2:8000`, release `""`), `buildConfigField("String","EXPLAIN_URL","\"https://aurelius-rust.vercel.app/api/explain\"")`, Compose aktiviert. `MainActivity` zeigt `Text("Aurelius")`.

- [ ] **Step 4: Smoke-Test schreiben und alles bauen**

```kotlin
// app/src/test/java/io/github/oxgi0/aurelius/SmokeTest.kt
import org.junit.Assert.assertEquals
import org.junit.Test

class SmokeTest {
    @Test fun `gradle und junit laufen`() { assertEquals(4, 2 + 2) }
}
```

Run: `JAVA_HOME=~/.jdks/temurin-21 ./gradlew test assembleDebug --console=plain`
Expected: BUILD SUCCESSFUL, APK unter `app/build/outputs/apk/debug/`

- [ ] **Step 5: git init + Commit**

```bash
git init -b main && git add -A && git commit -m "feat: Android-Projektgerüst (Compose, minSdk 26, F-Droid-taugliche Toolchain)"
```

---

### Task 2: Datenschicht — Zitate, Themen, ShuffleBag, römische Referenzen

**Files:**
- Create: `app/src/main/assets/quotes.json`, `assets/topics.json` (Kopie aus `aurelius/data/`)
- Create: `data/Quote.kt`, `data/Topic.kt`, `data/QuoteRepository.kt`, `data/ShuffleBag.kt`, `data/Roman.kt`, `data/ReadingList.kt`
- Test: `test/…/data/QuoteRepositoryTest.kt`, `ShuffleBagTest.kt`, `RomanTest.kt`

**Interfaces:**
- Produces:
  - `@Serializable data class Quote(val id: String, val book: Int, val section: Int, val texts: Map<String, String>)` — Schlüssel `de|en|grc`.
  - `@Serializable data class Topic(val id: String, val label: String, val quoteIds: List<String>)`
  - `class QuoteRepository(quotesJson: String, topicsJson: String)` mit `val quotes: List<Quote>`, `val topics: List<Topic>`, `fun byId(id: String): Quote?`, `fun byBook(book: Int): List<Quote>` (nach section sortiert), `fun books(): List<Pair<Int, Int>>` (Buchnr → Abschnittszahl, sortiert). Produktiv-Konstruktion aus Assets im `AppContainer`.
  - `class ShuffleBag(ids: List<String>, rng: kotlin.random.Random = Random.Default)` mit `fun next(): String` — Fisher-Yates, Pop vom Ende, keine Wiederholung über Rundengrenze (exakter Port von `lib/quotes.ts`).
  - `fun roman(n: Int): String` (1..12 → I..XII), `fun formatReference(q: Quote, bookWord: String): String` → `"Buch IV, 7"`.
  - `object ReadingList: List<ReadingItem>` — 8 Einträge aus `aurelius/data/readingList.ts` 1:1 übertragen (`title,titleEn,author,era("Antike"|"Modern"),note,noteEn`).

- [ ] **Step 1: Failing Tests** — Kernfälle:

```kotlin
class QuoteRepositoryTest {
    private val repo = QuoteRepository(readResource("quotes.json"), readResource("topics.json"))

    @Test fun `laedt alle 486 zitate mit drei sprachen`() {
        assertEquals(486, repo.quotes.size)
        repo.quotes.forEach { q ->
            assertEquals(q.id, "${q.book}-${q.section}")
            listOf("de", "en", "grc").forEach { assertTrue(q.texts.getValue(it).isNotBlank()) }
        }
    }
    @Test fun `buch 12 hat luecke bei 18`() {
        assertNull(repo.byId("12-18")); assertNotNull(repo.byId("12-19"))
        assertEquals(35, repo.byBook(12).size)
    }
    @Test fun `neun topics in fester reihenfolge`() {
        assertEquals(listOf("tod","wut","trauer","angst","familie","besitz","gelassenheit","pflicht","natur"),
            repo.topics.map { it.id })
    }
}
class ShuffleBagTest {
    @Test fun `zieht jede id genau einmal pro runde`() {
        val ids = listOf("a","b","c","d"); val bag = ShuffleBag(ids, Random(42))
        assertEquals(ids.toSet(), (1..4).map { bag.next() }.toSet())
    }
    @Test fun `keine wiederholung ueber rundengrenze`() {
        // Innerhalb einer Runde ist jede ID einmalig; der Rundengrenzen-Guard
        // verhindert Wiederholungen dazwischen → alle aufeinanderfolgenden
        // Ziehungen müssen verschieden sein.
        val bag = ShuffleBag(listOf("a", "b", "c"), Random(7))
        var prev = bag.next()
        repeat(60) { val cur = bag.next(); assertNotEquals(prev, cur); prev = cur }
    }
}
class RomanTest {
    @Test fun `roemische zahlen 1 bis 12`() { assertEquals("IV", roman(4)); assertEquals("XII", roman(12)) }
    @Test fun `referenz formatierung`() {
        val q = Quote("4-7", 4, 7, mapOf("de" to "x","en" to "x","grc" to "x"))
        assertEquals("Buch IV, 7", formatReference(q, "Buch"))
    }
}
```

- [ ] **Step 2: Ausführen — FAIL (Klassen fehlen).** `./gradlew test`
- [ ] **Step 3: Implementieren** — ShuffleBag-Port exakt:

```kotlin
class ShuffleBag(private val ids: List<String>, private val rng: Random = Random.Default) {
    private var bag = mutableListOf<String>()
    private var last: String? = null
    fun next(): String {
        if (bag.isEmpty()) refill()
        return bag.removeLast().also { last = it }
    }
    private fun refill() {
        bag = ids.toMutableList()
        for (i in bag.indices.reversed()) { if (i == 0) break
            val j = rng.nextInt(i + 1); val tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp }
        val top = bag.lastIndex
        if (bag.size > 1 && bag[top] == last) { val t = bag[top]; bag[top] = bag[0]; bag[0] = t }
    }
}
```

JSON-Laden mit `Json { ignoreUnknownKeys = true }`. Test-Ressourcen: die beiden JSON auch nach `src/test/resources/` verlinken/kopieren.

- [ ] **Step 4: Tests grün.** `./gradlew test`
- [ ] **Step 5: Commit** `feat: Datenschicht — Zitate, Themen, ShuffleBag, Referenzen`

---

### Task 3: Theme, Typografie, Navigation mit 5 Tabs

**Files:**
- Create: `ui/theme/Color.kt`, `ui/theme/Type.kt`, `ui/theme/Theme.kt`; `res/font/*.ttf` (Fraunces Medium/SemiBold, GFS Didot Regular — OFL, von fonts.google.com); `ui/nav/AureliusNav.kt`; leere Screens; `ui/components/Screen.kt`; `res/values*/strings.xml` (alle 84 Paritäts-Keys + Tab-Labels)
- Test: Manifest-/Build-Check + manueller Sichttest

**Interfaces:**
- Produces: `AureliusTheme(pref: ThemePref, content)` mit `LocalColors.current` (`bg,card,text,textSoft,accent,border`); `enum class ThemePref { Light, Dark, System }`; Fonts `FrauncesMedium`, `FrauncesSemiBold`, `GfsDidot`; Navigation `AureliusNav()` (BottomBar + NavHost, Routen `quote|books|favorites|aurel|stoa|settings|account|book/{n}|read/{id}`).

**Paritäts-Werte (exakt):**

| Token | Light | Dark |
|---|---|---|
| bg | `#F4EEE1` | `#0F151D` |
| card | `#FBF7ED` | `#161F2A` |
| text | `#1B2531` | `#EAE2D2` |
| textSoft | `#5A6575` | `#9AA3B0` |
| accent | `#A6763C` | `#C9A264` |
| border | `#E2D9C6` | `#26303D` |

Tab-Bar **immer dunkel** (Hintergrund `#161F2A`, Border oben `#26303D`, aktiv `#C9A264`, inaktiv `#9AA3B0`, Label 11sp). Tabs + Material-Symbols-Äquivalente der Ionicons: Zitat/`book`, Bücher/`library` (auto_stories), Ausgewählt/`star`, Marc Aurel/`medal` (military_tech), Stoa/`business` (account_balance passt besser: Tempel). `ThemePref.System` folgt `isSystemInDarkTheme()`.

- [ ] Steps: Fonts herunterladen (Google-Fonts-Repo, OFL-Lizenzdatei mit ins Repo), Theme + Nav implementieren, 7 leere Screens mit Titel-Text, App im Emulator/`assembleDebug` bauen, Sichtprüfung Tab-Wechsel + Dark/Light, Commit `feat: Theme, Fonts, 5-Tab-Navigation`.

---

### Task 4: Einstellungen-Store + Settings-Screen (ohne Konto)

**Files:**
- Create: `prefs/SettingsStore.kt`, `ui/screens/SettingsScreen.kt`, `ui/components/Segmented.kt`
- Test: `test/…/prefs/SettingsStoreTest.kt` (DataStore mit tmp-File), Sichttest

**Interfaces:**
- Produces: `class SettingsStore(context)` — `Flow`s + Setter für `uiLang: "de"|"en"` (Default de), `quoteLang: "de"|"en"|"grc"` (Default de), `themePref` (Default System), `anthropicKey: String?`; ungültige Werte fallen auf Default (Paritäts-Validierung). `Segmented(options, selectedIndex, onSelect)` — Pill-Optik: Border 1, radius 999, aktiv accent-Hintergrund mit `card`-Text.
- Screen-Parität: Sektionen App-Sprache (`Deutsch|English` hart), Zitat-Sprache (3), Erscheinungsbild (`Hell|Dunkel|System`), KI-Erklärung (Key-Eingabe secure, „Key speichern"-Pill, „Gespeichert." 2 s, Lösch-Zeile wenn vorhanden), Quellen-Fließtext mit Perseus-Hinweis. Kein Geräte-Locale-Override: UI-Sprache kommt NUR aus dem Store (Compose: eigener `LocalStrings`-Provider statt reiner res-Auflösung; strings.xml bleibt Quelle, Auflösung via `createConfigurationContext` mit gewählter Locale).

- [ ] Steps: Failing DataStore-Tests (Defaults, Validierung, Roundtrip) → implementieren → grün → SettingsScreen bauen → Sichttest → Commit `feat: Einstellungen (Sprache, Zitat-Sprache, Theme, BYOK-Key)`.

---

### Task 5: Zitat-Tab (Home) — QuoteCard, Chips, Shuffle, Fade

**Files:**
- Create: `ui/components/QuoteCard.kt`, `TopicChips.kt`, `ui/screens/QuoteScreen.kt` (+ `QuoteViewModel`)
- Test: `test/…/ui/QuoteViewModelTest.kt`, Sichttest

**Interfaces:**
- Produces: `QuoteCard(quote, lang, topInset, onTap?)`; `TopicChips(topics, selectedId?, onSelect)`; `QuoteViewModel(repo, settings)` mit `state: StateFlow<QuoteUiState(quote, topicId?, quoteLang)>`, `fun drawNext()`, `fun selectTopic(id: String?)` (No-Op bei gleichem Topic, sonst neuer Bag + Sofort-Swap), `fun setQuoteLang(l)` (persistiert).

**Parität:** Wortmarke `AURELIUS` (13sp, letterSpacing 5), Settings-Icon rechts; Medaillon 88 dp rund, 2 dp accent-Border, ragt 44 dp in die Karte (`topInset=64`); Karte Border 1/radius 20/padding 28, minHeight 220, Text zentriert, de/en Fraunces 23/36, grc GFS Didot 22/34; Referenz `BUCH IV, 7` uppercase accent 12sp/ls2; Fade 150 ms raus → Swap → 250 ms rein; Chips „Alle"+9 (aktiv: accent-Hintergrund, Text `bg`); Button „Neuer Gedanke" Outline-Pill 1.5/999. Karte tappbar = drawNext.

- [ ] Steps: ViewModel-Tests (drawNext wechselt, selectTopic gleicher Wert No-Op, Topic-Pool respektiert, Sprachwechsel persistiert — Fake-SettingsStore) → rot → implementieren → grün → UI bauen + Sichttest → Commit `feat: Zitat-Tab mit ShuffleBag, Themen-Chips, Fade`.

---

### Task 6: Bücher, Buchansicht, Leseansicht, Aurel- und Stoa-Tab

**Files:**
- Create: `ui/screens/BooksScreen.kt`, `BookScreen.kt`, `ReadScreen.kt`, `AurelScreen.kt`, `StoaScreen.kt`; `res/drawable/marcus_portrait.jpg`, `marcus_medallion.jpg` (Kopien aus `aurelius/assets/images/`)
- Test: Sichttest je Screen (alle Bücher öffnen, 12-18-Lücke prüfen, `read/4-7`)

**Parität:** Bücherliste aus `repo.books()` („Buch IV" Fraunces 17 + „51 Abschnitte" + Chevron); darunter „Stoische Bibliothek" mit den 8 ReadingList-Karten (Kicker `AUTOR · ANTIKE|MODERN` 11sp/ls2 accent, nicht tappbar). Buchansicht: Zurück-Header, Zeilen `nr (13sp bold accent, minWidth 24, rechtsbündig) + Vorschau texts[quoteLang] max 2 Zeilen`. Leseansicht: QuoteCard (nicht tappbar) + Segmented(3) + FavoriteStar + ExplainSection (Platzhalter bis Task 9/10). Aurel: Porträt 3:4 max 320 dp radius 16, H1 hart „Marc Aurel", 3 Textabschnitte. Stoa: 4 Karten mit `01 · UNTERSCHEIDE`-Kickern + 2 Abschnitte. Alle Texte aus den i18n-Keys der Expo-App.

- [ ] Steps: implementieren → Sichttest → Commit `feat: Bücher/Lese-Ansichten, Aurel- und Stoa-Tab`.

---

### Task 7: Favoriten lokal (Room) + Favoriten-Tab

**Files:**
- Create: `db/AppDatabase.kt`, `db/FavoriteEntity.kt`, `db/PendingOpEntity.kt`, `db/FavoriteDao.kt`; `ui/components/FavoriteStar.kt`; `ui/screens/FavoritesScreen.kt`; `sync/FavoritesRepository.kt` (erst lokal)
- Test: `test/…/sync/FavoritesRepositoryTest.kt` (Room in-memory via Robolectric ODER DAO hinter Interface + Fake — nimm Fake-DAO, bleibt reine JVM)

**Interfaces:**
- Produces: `FavoriteEntity(quoteId: String @PrimaryKey, createdAt: Long)`; `PendingOpEntity(id: Long auto, quoteId: String, op: String "add"|"remove", queuedAt: Long)`; `FavoriteDao` (Flow<List<FavoriteEntity>>, upsert, delete, queue-CRUD). `FavoritesRepository(dao, api?, tokenStore)` mit `val favorites: Flow<List<String>>`, `suspend fun toggle(quoteId)`, Reihenfolge = Einfüge-Reihenfolge. FavoriteStar beobachtet den Flow (globaler Zustand — Verbesserung ggü. Expo, dort pro-Instanz).
- Tab-Parität: leer = Stern 40 dp + `favEmptyTitle/Text`; gefüllt = Karten mit Referenz-Uppercase, Vorschau `texts[quoteLang]` max 3 Zeilen (bewusste Verbesserung), Stern rechts, Tap → read.

- [ ] Steps: Failing Repo-Tests (toggle add/remove, Reihenfolge, Flow-Update) → implementieren → grün → UI + Sichttest → Commit `feat: lokale Favoriten (Room) + Ausgewählt-Tab`.

---

### Task 8: Backend-Client + Konto-UI (Registrierung, Login, Logout)

**Files:**
- Create: `net/BackendApi.kt`, `net/ApiError.kt`, `prefs/TokenStore.kt`, `ui/screens/AccountScreen.kt` (+ Einstieg als Sektion „Konto" oben im SettingsScreen)
- Test: `test/…/net/BackendApiTest.kt` mit MockWebServer

**Interfaces:**
- Produces (Vertrag = README aurelius-backend):

```kotlin
interface BackendApi {
    @POST("api/auth/registration/") suspend fun register(@Body b: RegisterBody): DetailResponse
    @POST("api/auth/registration/verify-email/") suspend fun verifyEmail(@Body b: KeyBody): DetailResponse
    @POST("api/auth/login/") suspend fun login(@Body b: LoginBody): TokenResponse   // {"key": "…"}
    @POST("api/auth/logout/") suspend fun logout(): DetailResponse
    @GET("api/favorites/") suspend fun favorites(): List<FavoriteDto>              // quote_id, created_at
    @PUT("api/favorites/{id}/") suspend fun putFavorite(@Path("id") id: String): FavoriteDto
    @DELETE("api/favorites/{id}/") suspend fun deleteFavorite(@Path("id") id: String): Response<Unit>
}
```

  OkHttp-Interceptor hängt `Authorization: Token <key>` an, wenn `TokenStore.token != null`. `TokenStore` = EncryptedSharedPreferences (`aurelius.token`, `aurelius.email`). Fehler-Mapping `ApiError`: IOException→`Offline`, 400→`Validation(feldFehlerText)`, 401→`Unauthorized`, 429→`RateLimited`, sonst `Server`.
- Konto-UI: ohne Login → E-Mail+Passwort-Felder, Buttons „Registrieren" (Erfolg → Hinweis „Bestätigungs-Mail verschickt — danach einloggen") und „Anmelden"; mit Login → E-Mail-Anzeige + „Abmelden" + Hinweis auf Favoriten-Sync. Passwort-Reset: Link-Zeile „Passwort vergessen?" → ruft `POST api/auth/password/reset/` mit der E-Mail auf und zeigt „Mail verschickt, folge dem Link". Neue i18n-Keys de+en (accTitle, accEmail, accPassword, accRegister, accLogin, accLogout, accVerifySent, accResetSent, accForgot, accSynced …).

- [ ] Steps: MockWebServer-Tests (login speichert Token; 400 mit `{"email":["…"]}` → Validation; Interceptor setzt Header; logout löscht Token) → rot → implementieren → grün → UI + Sichttest gegen laufendes lokales Django (`10.0.2.2:8000`) → Commit `feat: Konto — Registrierung, Login, Token-Auth gegen aurelius-backend`.

---

### Task 9: Favoriten-Sync (Merge, optimistisch, Offline-Queue)

**Files:**
- Modify: `sync/FavoritesRepository.kt`
- Test: `test/…/sync/FavoritesSyncTest.kt` (MockWebServer + Fake-DAO)

**Interfaces:**
- Produces: `suspend fun onLogin()` — Merge: alle lokalen IDs per PUT hochladen, dann GET Gesamtliste → Room ersetzt lokalen Stand (Vereinigung, nichts geht verloren). `toggle()` bei vorhandenem Token: lokal sofort (optimistisch) + API-Call; bei IOException → PendingOp in Queue. `suspend fun flushQueue()` — beim App-Start und nach Netz-Fehlern erneut versuchen (einfaches Retry beim nächsten Aufruf, kein WorkManager — YAGNI, dokumentiert). 401 überall → Token löschen, UI zeigt Konto-Hinweis, lokale Favoriten bleiben.

- [ ] Steps: Failing Tests (Merge vereinigt beide Seiten; Offline-toggle landet in Queue; flushQueue arbeitet ab und leert; 401 löscht Token, behält lokale Daten) → implementieren → grün → Sichttest: Login am Emulator, Favoriten auf zwei „Geräten" (Emulator + Web später) → Commit `feat: Favoriten-Sync mit Merge und Offline-Queue`.

---

### Task 10: KI-Erklärungen — Streaming (Gratis-Endpoint + BYOK Anthropic)

**Files:**
- Create: `net/ExplainClient.kt`, `net/AnthropicClient.kt`, `ui/components/StreamingText.kt`, `ExplainSection.kt`; ReadScreen/QuoteScreen einbinden
- Test: `test/…/net/ExplainClientTest.kt` (MockWebServer, gechunkter Plain-Text; Fehlerfälle)

**Interfaces:**
- Produces: `fun explainStream(quote, quoteLang, uiLang, anthropicKey: String?): Flow<String>` — Key vorhanden → Anthropic SSE (`POST https://api.anthropic.com/v1/messages`, Header `x-api-key`, `anthropic-version: 2023-06-01`, Body `model=claude-opus-5, max_tokens=1024, stream=true, system=<explainSystem>`, SSE-Events parsen: nur `content_block_delta`/`text_delta`); sonst → `POST BuildConfig.EXPLAIN_URL` mit `{"text","reference","uiLang"}`, Antwort = roher text/plain-Stream, chunkweise emittieren. Prompts 1:1 aus `aurelius/lib/ai/prompt.ts` übersetzen (System + 120–180-Wörter-Anweisung, de/en-Varianten, »« vs. “”). Fehler → `ExplainException(kind: offline|auth|rate_limited|not_configured|server)`; Mapping wie Expo (`429`→rate_limited, Body enthält `GEMINI_API_KEY`→not_configured, Netz→offline).
- UI-Parität: „Erklären"-Pill (accent-Hintergrund, Text `bg`, disabled+0.6 während busy); StreamingText 16sp/26 mit blinkendem `▌` (450 ms-Zyklus, accent); Fehlertext zentriert accent; Zitatwechsel verwirft Stream (requestId-Zähler). Verbesserung: bei Abbruch bleibt bisheriger Text stehen, Fehler darunter.

- [ ] Steps: Failing Tests (Chunks kommen in Reihenfolge an; 429→rate_limited; `{"error":"GEMINI_API_KEY fehlt"}`→not_configured; Netzfehler→offline) → implementieren → grün → Sichttest mit echtem Endpoint → Commit `feat: KI-Erklärungen mit Streaming (Gratis-Modus + eigener Claude-Key)`.

---

### Task 11: F-Droid-Packaging, Metadaten, README, Release

**Files:**
- Create: `LICENSE` (GPL-3.0-or-later — vor dem GitHub-Push vom User bestätigen lassen!), `README.md` (de/en Kurzform, Screenshot-Platzhalter erst nach echtem Gerätetest), `fastlane/metadata/android/de-DE/{title.txt,short_description.txt,full_description.txt}` + `en-US/…`; App-Icons aus `aurelius/assets/images/` (adaptive icon foreground/background/monochrome → `mipmap-anydpi-v26` XML + PNGs)
- Modify: `app/build.gradle.kts` (Release-Build: `minifyEnabled false` fürs erste — reproduzierbarer; `dependenciesInfo { includeInApk = false; includeInBundle = false }` — Pflicht für F-Droid-Reproduzierbarkeit)
- Test: `./gradlew assembleRelease` baut; `apksigner`/unsigniertes APK vorhanden; kompletter Testdurchlauf `./gradlew test`

**Steps:** Icons portieren → Metadaten schreiben (Kurzbeschreibung ≤ 80 Zeichen, Langbeschreibung mit Feature-Liste + Quellen-Lizenzen) → Release-Konfig → Suite + Release-Build grün → Commit `feat: F-Droid-Metadaten, Lizenz, Release-Konfiguration` → GitHub-Repo `aurelius-android` anlegen + push (User-Freigabe für Lizenz + Push einholen). Die eigentliche F-Droid-Einreichung (RFP/Merge-Request bei fdroiddata) ist Teilprojekt 4.

---

## Reihenfolge & Abhängigkeiten

1 → 2 → 3 → dann 4–7 in Reihenfolge (7 braucht 3+2), 8 → 9 (braucht 7+8), 10 unabhängig ab 4, 11 zuletzt. Nach jedem UI-Task: Sichttest im Emulator oder per `adb install` auf dem Gerät des Users.
