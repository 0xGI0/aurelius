<p align="center">
  <img src="docs/logo.png" width="120" alt="Stoa-Logo: Lorbeerkranz">
</p>
<h1 align="center">Stoa Backend</h1>
<p align="center">
  <a href="#deutsch">Deutsch</a> · <a href="#english">English</a>
</p>
<p align="center">
  <img src="docs/marcus-portrait.jpg" width="170" alt="Büste des Marc Aurel (Glyptothek München)">
  &nbsp;
  <img src="docs/epictetus.jpg" width="144" alt="Epiktet (Kupferstich, Oxford 1715)">
  &nbsp;
  <img src="docs/seneca.jpg" width="158" alt="Pseudo-Seneca-Büste (Foto: Marie-Lan Nguyen, CC BY 2.5)">
</p>

---

## Deutsch

Selbst gehostetes Backend für [Stoa](https://github.com/0xGI0/stoa)
(Marc-Aurel-Zitate-App): Nutzerkonten (E-Mail + Passwort, Verifizierung,
Token-Auth) und geräteübergreifende Zitat-Favoriten für die
[Android-App](../android/) und die
[Web-App](../web/). Django + Django REST Framework.

### Entwicklung

    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    .venv/bin/python manage.py migrate
    .venv/bin/python manage.py createsuperuser   # für /admin/
    .venv/bin/python manage.py runserver          # http://127.0.0.1:8000

E-Mails (Verifizierung, Passwort-Reset) erscheinen lokal in der Konsole;
die Links darin funktionieren direkt im Browser.
Tests: `.venv/bin/python manage.py test`

### API

Auth-Header: `Authorization: Token <key>` (Token kommt vom Login).

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/api/auth/registration/` | Konto anlegen (`email`, `password1`, `password2`) → Verifizierungs-Mail |
| POST | `/api/auth/registration/verify-email/` | E-Mail per API bestätigen (`key`) — der Mail-Link bestätigt auch direkt |
| POST | `/api/auth/login/` | Login (`email`, `password`) → `{"key": "<token>"}` |
| POST | `/api/auth/logout/` | Token widerrufen |
| GET | `/api/auth/user/` | Eigenes Profil |
| POST | `/api/auth/password/reset/` | Passwort-Reset-Mail (Link führt zum Formular) |
| GET | `/api/favorites/` | `[{"quote_id": "5-23", "created_at": "…"}]` |
| PUT | `/api/favorites/<quote_id>/` | Favorit setzen — 201 neu, 200 vorhanden (idempotent) |
| DELETE | `/api/favorites/<quote_id>/` | Favorit entfernen — immer 204 (idempotent) |

`quote_id`-Format: `buch-abschnitt` (`^\d{1,2}-\d{1,3}$`), z. B. `5-23`.

---

## English

Self-hosted backend for [Stoa](https://github.com/0xGI0/stoa)
(a Stoic classics app): user accounts (email + password, verification,
token auth) and cross-device quote favorites for the
[Android app](../android/) and the
[web app](../web/). Django + Django REST Framework.

### Development

    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    .venv/bin/python manage.py migrate
    .venv/bin/python manage.py createsuperuser   # for /admin/
    .venv/bin/python manage.py runserver          # http://127.0.0.1:8000

Emails (verification, password reset) are printed to the console locally;
the links inside them work directly in the browser.
Tests: `.venv/bin/python manage.py test`

### API

Auth header: `Authorization: Token <key>` (the token comes from login).

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/registration/` | Create account (`email`, `password1`, `password2`) → verification email |
| POST | `/api/auth/registration/verify-email/` | Verify via API (`key`) — the email link also verifies directly |
| POST | `/api/auth/login/` | Sign in (`email`, `password`) → `{"key": "<token>"}` |
| POST | `/api/auth/logout/` | Revoke token |
| GET | `/api/auth/user/` | Own profile |
| POST | `/api/auth/password/reset/` | Password reset email (link leads to a form) |
| GET | `/api/favorites/` | `[{"quote_id": "5-23", "created_at": "…"}]` |
| PUT | `/api/favorites/<quote_id>/` | Add favorite — 201 new, 200 existing (idempotent) |
| DELETE | `/api/favorites/<quote_id>/` | Remove favorite — always 204 (idempotent) |

`quote_id` format: `book-section` (`^\d{1,2}-\d{1,3}$`), e.g. `5-23`.
