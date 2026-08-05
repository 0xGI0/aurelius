# Web-Anbindung (Teilprojekt 3) — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die bestehende Expo-Web-App bekommt Konto-Login und Favoriten-Sync gegen `aurelius-backend` — dasselbe Konto wie die Kotlin-App; zusätzlich werden die E-Mail-Links des Backends (Verifizierung, Passwort-Reset) funktionsfähig.

**Architecture:** Kein neues Framework — schlanker fetch-Client (`lib/api.ts`) mit Token aus `lib/storage`; `lib/favorites.ts` kapselt Lokal-first-Sync (Merge beim Login, optimistische Toggles, Offline-Queue im Storage) und ersetzt die direkten Favoriten-Funktionen aus `lib/settings.ts`. Konto-UI als neue Sektion oben in `app/settings.tsx`. Die E-Mail-Links erledigt das Backend selbst mit zwei kleinen HTML-Seiten (Confirm-on-GET, Reset-Formular) — so funktionieren sie für Web- UND Android-Nutzer ohne Frontend-Routing.

**Tech Stack:** Bestehend — Expo/React Native (TS), Jest; Backend Django (aurelius-backend).

## Global Constraints

- Zwei Repos: Task W1 in `/home/x/Dokumente/Github/aurelius-backend`, W2–W4 in `/home/x/Dokumente/Github/aurelius`.
- Backend-URL im Web: `process.env.EXPO_PUBLIC_BACKEND_URL ?? ''` — leer ⇒ Konto-Sektion zeigt nur einen Hinweis (wie Android `acc_no_server`); Produktion wird erst in Teilprojekt 4 gesetzt. Lokal: `.env`-Eintrag `EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000`.
- Storage-Keys neu: `aurelius.token`, `aurelius.email`, `aurelius.pendingOps` (JSON-Array `{quoteId, op}`); bestehende Keys unverändert (Parität).
- i18n: neue Konto-Strings de+en in `lib/i18n.ts` — gleiche Texte wie die Android-App (accTitle, accHint, accEmail, accPassword, accRegister, accLogin, accLogout, accVerifySent, accResetSent, accForgot, accLoggedInAs, accSynced, accOffline, accNoServer).
- Tests: Jest (`npm test`); jeder Task endet mit grüner Suite + Commit (deutsch, Conventional Commits). Push auf main erst am Task-W4-Ende (löst Vercel-Deploy aus).

---

### Task W1: Backend — E-Mail-Links funktionsfähig machen

**Files (aurelius-backend):**
- Modify: `config/urls.py`, `config/settings.py`
- Create: `accounts/views.py`-Inhalte + `accounts/templates/accounts/{confirmed,reset_form,reset_done}.html`
- Test: `accounts/tests.py` (Klasse ergänzen)

**Interfaces:**
- Produces: `GET /api/auth/registration/account-confirm-email/<key>/` bestätigt die Adresse direkt (allauth `ACCOUNT_CONFIRM_EMAIL_ON_GET = True` + allauth-Confirm-View statt Platzhalter) und zeigt eine Mini-HTML-Seite „E-Mail bestätigt — du kannst dich jetzt in der App anmelden."; `GET/POST /api/auth/password/reset/confirm/<uidb64>/<token>/` = Djangos `PasswordResetConfirmView` mit Mini-Formular (neues Passwort 2×) und Erfolgsseite.
- [ ] Failing Tests: GET auf Confirm-Link verifiziert (`EmailAddress.verified == True`, danach Login 200); GET auf Reset-Link liefert 200 mit Formular, POST setzt Passwort (Login mit neuem Passwort 200).
- [ ] Implementieren: allauth-`confirm_email`-View einhängen, `ACCOUNT_CONFIRM_EMAIL_ON_GET=True`, `PasswordResetConfirmView.as_view(template_name=…, success_url=…)`, drei schlichte Templates (Inline-CSS, Markenfarben).
- [ ] Suite grün → Commit `feat: E-Mail-Links bestätigen direkt (Verify-on-GET, Reset-Formular)` → Push (Backend-Repo ist schon öffentlich).

### Task W2: Web-API-Client + Token-Storage

**Files (aurelius):**
- Create: `lib/api.ts`; Test: `lib/__tests__/api.test.ts`

**Interfaces:**
- Produces: `getToken()/setSession(token,email)/clearSession()/getSessionEmail()` (Storage-basiert, async); `apiFetch(path, init?)` hängt `Authorization: Token …` an; `register(email,pw)`, `login(email,pw)` (speichert Session), `logout()` (widerruft + löscht), `passwordReset(email)`, `getServerFavorites(): Promise<string[]>`, `putFavorite(id)`, `deleteFavorite(id)`. Fehler als `ApiError` mit `kind: 'offline'|'validation'|'unauthorized'|'rate_limited'|'server'` (+ `detail` bei validation, DRF-Feldfehler zusammengefügt).
- [ ] Failing Tests (fetch gemockt): login speichert Token+Email; Header gesetzt; 400-Mapping mit Feldtext; 401 → unauthorized + Session gelöscht; Netzfehler → offline.
- [ ] Implementieren → grün → Commit `feat(web): API-Client für aurelius-backend`.

### Task W3: Favoriten-Sync im Web

**Files (aurelius):**
- Create: `lib/favorites.ts`; Modify: Aufrufer von `getFavorites/toggleFavorite` aus `lib/settings.ts` auf das neue Modul umstellen (Favoriten-Tab, FavoriteStar); Test: `lib/__tests__/favoritesSync.test.ts`

**Interfaces:**
- Produces: `getFavorites()`, `toggleFavorite(id)` (Signatur-kompatibel zu heute, lokal sofort; bei Session zusätzlich API, Fehler → Queue), `onLogin()` (PUT alle lokalen → GET Gesamtliste → lokal ersetzen → `flushQueue()`), `flushQueue()` (beim App-Start aus `app/_layout.tsx` aufgerufen), 401 überall → `clearSession()`, lokale Daten bleiben.
- [ ] Failing Tests: Merge vereinigt; Offline-Toggle queued; flushQueue leert; ohne Session rein lokal (Parität zu heute).
- [ ] Implementieren → grün → Commit `feat(web): Favoriten-Sync mit Merge und Offline-Queue`.

### Task W4: Konto-UI in den Einstellungen + Browser-Sichttest

**Files (aurelius):**
- Modify: `app/settings.tsx` (neue Sektion „Konto" oben), `lib/i18n.ts` (neue Keys), `app/_layout.tsx` (flushQueue beim Start)

**Interfaces:**
- Consumes: W2/W3. UI-Verhalten wie Android-AccountScreen: ausgeloggt E-Mail+Passwort+Anmelden/Registrieren/„Passwort vergessen?"-Zeile + Statustext; eingeloggt „Angemeldet als …" + Abmelden + Sync-Hinweis; ohne `EXPO_PUBLIC_BACKEND_URL` nur Hinweistext.
- [ ] Implementieren; `npm test` + `npx tsc --noEmit` grün.
- [ ] **Sichttest Ende-zu-Ende** (Chrome-Extension): lokales Django starten, Expo-Web-Dev starten, im Browser registrieren → Mail-Link aus Django-Konsole öffnen (bestätigt jetzt direkt!) → einloggen → Favorit setzen → per curl gegenprüfen, dass er am Server liegt.
- [ ] Commit `feat(web): Konto-Login und Favoriten-Sync` → Push auf main (Vercel deployt; Konto-Bereich bleibt in Produktion hinter dem No-Server-Hinweis, bis Teilprojekt 4 die URL setzt).
