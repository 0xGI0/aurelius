# Design: Eigenes Backend + native Kotlin-App für Aurelius

**Datum:** 2026-08-05
**Status:** Entwurf — wartet auf Review

## 1. Kontext und Ziele

Aurelius (Marc-Aurel-Zitate-App, Expo/React Native, Web-Version live auf Vercel) bekommt
Nutzerkonten mit geräteübergreifenden Favoriten. Der frühere Plan dafür (Supabase) ist
verworfen: Free-Tier pausiert nach 7 Tagen Inaktivität, E-Mail-Versand auf 2/h limitiert,
und der Betreiber will den Stack selbst bauen, betreiben und dabei lernen.

**Ziele:**

- Eigenes, selbst gehostetes Backend — „sicher von Natur aus" hat Priorität.
- Neue **native Android-App in Kotlin** mit vollem Funktionsumfang der Expo-App,
  veröffentlicht über **F-Droid** (echte Aufnahme in den Haupt-Katalog als Ziel).
- Bestehende Expo-Web-App bleibt und wird an das neue Backend angebunden.
- Ein Konto funktioniert überall: Login am Handy ↔ Browser, gleiche Favoriten.
- Entwicklung komplett lokal; VPS-Miete und Deployment erst am Schluss.

**Nicht-Ziele (bewusst außen vor):**

- Kein Umzug der KI-Erklärungen ins neue Backend (bleiben auf Vercel `/api/explain`).
- Keine iOS-App, kein Play-Store-Release (F-Droid zuerst; APK zusätzlich via GitHub Releases möglich).
- Kein Social-Login (nur E-Mail + Passwort).
- Expo-Android-Build wird nicht weiterentwickelt (Android kommt künftig aus Kotlin).

## 2. Getroffene Entscheidungen

| Entscheidung | Wahl | Begründung |
|---|---|---|
| Backend-Sprache | **Python + Django** | Auth seit ~20 Jahren gehärtet und eingebaut (Passwort-Hashing, Sessions, CSRF, Reset-Flows); Admin-UI gratis; „sicher von Natur aus" war das Entscheidungskriterium gegen Ktor/Go |
| API-Schicht | **Django REST Framework + dj-rest-auth/allauth** | Fertige, breit geprüfte Endpunkte für Registrierung, E-Mail-Verifizierung, Login, Passwort-Reset |
| Auth-Mechanismus | **Token-Auth (DRF TokenAuthentication)** | Serverseitig widerrufbar, einfach zu verstehen/debuggen; JWT verworfen (Widerruf komplex, Fehlkonfigurationsrisiko, Skalierungsvorteil unnötig); Session-Cookies verworfen (in nativen Apps unüblich) |
| Datenbank | **SQLite lokal → Postgres in Produktion** | Django abstrahiert den Wechsel; lokal null Setup |
| App-Stack | **Kotlin + Jetpack Compose (Material 3)** | Moderner nativer Standard; Lernziel des Betreibers |
| App-Bibliotheken | Retrofit, Room, DataStore, kotlinx-serialization | Etabliert, alle FOSS (Apache-2.0) → F-Droid-tauglich |
| Hosting | **Hetzner-VPS (~4–5 €/Mon), Kauf erst beim Deployment** | Zuverlässig, EU; Oracle Free als verworfen dokumentiert (Registrierungs-/Kapazitäts-/Limit-Risiko) |
| E-Mail-Versand | Lokal: Console-Backend; Produktion: Resend (Free Tier) o. vergleichbares SMTP | Djangos Default-Mail braucht ohnehin einen SMTP-Anbieter |

## 3. Architektur

```
Expo-Web (Vercel, bleibt)      ──┐   Token-Auth über HTTPS
                                 ├──► Django-Backend ──► Postgres
Kotlin-App (neu, F-Droid)      ──┘   (lokal → Hetzner)   User, Tokens, Favoriten

KI-Erklärungen: beide Clients → bestehender Vercel-Endpoint /api/explain (unverändert)
```

Die Zitate (`quotes.json`, IDs wie `"1-1"`) bleiben in beiden Clients gebündelt.
Das Backend kennt nur User und Favoriten-IDs — es ist bewusst klein.

## 4. Backend-Design

**Datenmodell:**

- Django-Standard-User (E-Mail als Login-Feld).
- `Favorite(user FK, quote_id CharField, created_at)` mit Unique-Constraint `(user, quote_id)`.

**API-Endpunkte** (alle unter `/api/`):

| Endpunkt | Zweck |
|---|---|
| `POST /auth/registration/` | Konto anlegen, Verifizierungs-Mail |
| `POST /auth/registration/verify-email/` | E-Mail bestätigen |
| `POST /auth/login/` → `{key}` | Token holen |
| `POST /auth/logout/` | Token widerrufen |
| `POST /auth/password/reset/` (+ `confirm/`) | Passwort-Reset per Mail |
| `GET /auth/user/` | Eigenes Profil |
| `GET /favorites/` | Liste `[{quote_id, created_at}]` |
| `PUT /favorites/{quote_id}/` | Favorit setzen (idempotent) |
| `DELETE /favorites/{quote_id}/` | Favorit entfernen |

`quote_id` wird gegen das Muster `buch-abschnitt` validiert (kein freier Text).
CORS nur für die Vercel-Domain(s). Rate-Limiting (DRF-Throttling) auf den Auth-Endpunkten.
Django-Admin aktiv für Einblick in User/Favoriten.

## 5. Kotlin-App-Design

**Funktionsumfang = Parität zur Expo-App:** fünf Tabs (Heute, Bücher, Aurel, Stoa,
Favoriten), Einstellungen, Buch- und Leseansicht, zweisprachige UI (de/en via
Android-String-Ressourcen), Zitattexte de/en/grc aus gebündeltem `quotes.json`,
Themen-Filter, KI-Erklärungen über den Vercel-Endpoint, Favoriten mit Konto-Sync.

**Struktur** (Single-Module zum Start, klar getrennte Packages):

- `data/` — Room-Datenbank (Favoriten, Sync-Queue), Retrofit-API-Client, Repositories,
  DataStore (Einstellungen, Token in EncryptedSharedPreferences/Keystore).
- `ui/` — Compose-Screens je Tab, Navigation, Material-3-Theme in den bestehenden
  Markenfarben (#0F151D Ink, #C9A264 Bronze, #F4EEE1 Cream).
- `sync/` — Merge- und Nachhol-Logik (siehe §6).

**F-Droid-Tauglichkeit als Designbedingung:** keine Google-Play-Services, keine
proprietären Abhängigkeiten, kein Tracking; Build reproduzierbar aus dem Quellcode;
Fastlane-Metadatenstruktur (`metadata/de`, `metadata/en`) von Anfang an im Repo;
eigenes Git-Repository (z. B. `aurelius-android`), da F-Droid pro App ein Quell-Repo baut.

## 6. Favoriten-Sync (gilt für beide Clients)

- **Ohne Konto:** rein lokal wie bisher (Room bzw. localStorage). Kein Zwang zum Konto.
- **Beim ersten Login:** Vereinigung — lokale Favoriten werden per `PUT` hochgeladen,
  danach `GET` der Gesamtliste. Nichts geht verloren.
- **Danach:** Server ist die Quelle der Wahrheit. Änderungen werden optimistisch in der
  UI angezeigt und im Hintergrund gesendet.
- **Offline:** Änderungen landen in einer lokalen Queue (Room-Tabelle) und werden beim
  nächsten Netzkontakt nachgeholt. Konfliktregel: zuletzt gemeldete Aktion gewinnt
  (bei einer Favoritenliste unkritisch).

## 7. Fehlerbehandlung

- App bleibt offline voll benutzbar (Zitate sind lokal); nur Sync und KI-Erklärungen
  brauchen Netz und sagen das verständlich, zweisprachig.
- `401` (Token abgelaufen/widerrufen) → lokaler Logout mit Hinweis, Favoriten bleiben
  lokal erhalten; kein Crash, keine Endlos-Retries.
- Serverfehler beim Sync → Queue behält Einträge, Retry mit Backoff.

## 8. Tests

- **Backend:** Django-Testsuite für Auth-Flows (Registrierung→Verifizierung→Login→
  Logout, Reset) und Favoriten-API inkl. Rechteprüfung (User A sieht nie Favoriten von
  User B) und `quote_id`-Validierung. Das Sicherheitskritische zuerst.
- **Kotlin-App:** Unit-Tests für Repository- und Sync-Logik (Merge, Queue, 401-Fall);
  Basis-UI-Tests (Compose) für Navigation und Favoriten-Toggle.
- **Web-Anbindung:** bestehende Jest-Suite um Login/Sync-Logik erweitern.

## 9. Deployment (letzter Schritt)

Hetzner-VPS (kleinste Stufe; Anbieter-Endcheck beim Kauf), Ubuntu LTS: Postgres, Gunicorn hinter
**Caddy** (automatisches HTTPS), systemd-Services, tägliches `pg_dump`-Backup per
Cronjob, unattended-upgrades. API unter einer Subdomain einer vorhandenen Domain
(z. B. `api.…` — konkrete Domain wird beim Deployment entschieden). `DEBUG=False`,
Secrets als Env-Vars.

## 10. Reihenfolge und Teilprojekte

Das Vorhaben ist zu groß für einen einzigen Implementierungsplan und wird in vier
Teilprojekte zerlegt, jedes mit eigenem Plan:

1. **Backend** — Django-Projekt, Auth, Favoriten-API, Tests (rein lokal).
2. **Kotlin-App** — natives Android, volle Parität, gegen das lokale Backend.
3. **Web-Anbindung** — Login + Favoriten-Sync in der bestehenden Expo-App.
4. **Go-Live** — VPS-Deployment, dann F-Droid-Einreichung (Reihenfolge zwingend:
   die veröffentlichte App braucht die echte Server-URL).

Die Teilprojekte 2 und 3 sind nach 1 unabhängig voneinander; 4 setzt 1–3 voraus.
