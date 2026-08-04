# aurelius-backend

Selbst gehostetes Backend für Aurelius (Marc-Aurel-Zitate-App):
Nutzerkonten (E-Mail + Passwort, Verifizierung, Token-Auth) und
geräteübergreifende Zitat-Favoriten. Django + Django REST Framework.

## Entwicklung

    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    .venv/bin/python manage.py migrate
    .venv/bin/python manage.py createsuperuser   # für /admin/
    .venv/bin/python manage.py runserver          # http://127.0.0.1:8000

E-Mails (Verifizierung, Passwort-Reset) erscheinen lokal in der Konsole.
Tests: `.venv/bin/python manage.py test`

## API

Auth-Header: `Authorization: Token <key>` (Token kommt vom Login).

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/api/auth/registration/` | Konto anlegen (`email`, `password1`, `password2`) → Verifizierungs-Mail |
| POST | `/api/auth/registration/verify-email/` | E-Mail bestätigen (`key` aus der Mail) |
| POST | `/api/auth/login/` | Login (`email`, `password`) → `{"key": "<token>"}` |
| POST | `/api/auth/logout/` | Token widerrufen |
| GET | `/api/auth/user/` | Eigenes Profil |
| POST | `/api/auth/password/reset/` (+ `confirm/`) | Passwort-Reset per Mail |
| GET | `/api/favorites/` | `[{"quote_id": "5-23", "created_at": "…"}]` |
| PUT | `/api/favorites/<quote_id>/` | Favorit setzen — 201 neu, 200 vorhanden (idempotent) |
| DELETE | `/api/favorites/<quote_id>/` | Favorit entfernen — immer 204 (idempotent) |

`quote_id`-Format: `buch-abschnitt` (`^\d{1,2}-\d{1,3}$`), z. B. `5-23`.

Design-Spec und Gesamtplan: `aurelius`-Repo unter `docs/superpowers/`.
