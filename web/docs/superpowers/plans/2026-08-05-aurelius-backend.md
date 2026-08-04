# Aurelius-Backend (Teilprojekt 1) — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Selbst gehostetes Django-Backend mit E-Mail/Passwort-Konten (Verifizierung, Passwort-Reset, Token-Auth) und Favoriten-API für Aurelius — rein lokal entwickelt und getestet.

**Architecture:** Ein neues Repo `aurelius-backend` neben dem bestehenden `aurelius`-Repo. Django + Django REST Framework; Registrierung/Login/Reset kommen fertig aus dj-rest-auth + django-allauth (Token-Auth, serverseitig widerrufbar). Eigene App `favorites` mit Miniatur-Datenmodell (`user`, `quote_id`, `created_at`). SQLite lokal, E-Mails landen in der Konsole.

**Tech Stack:** Python ≥3.12, Django ≥5.2,<6.0 (LTS), djangorestframework ≥3.16, dj-rest-auth ≥7.0, django-allauth ≥65.4, django-cors-headers ≥4.7.

**Spec:** `aurelius/docs/superpowers/specs/2026-08-05-aurelius-backend-kotlin-design.md`

## Global Constraints

- Arbeitsverzeichnis: `/home/x/Dokumente/Github/aurelius-backend` (Task 1 erstellt es; alle späteren Kommandos laufen dort).
- Alle Kommandos nutzen das venv: `.venv/bin/python`, `.venv/bin/pip` (kein global installiertes pip/django).
- pip ggf. mit `--no-cache-dir` bzw. Sandbox-Bypass ausführen (bekanntes EROFS-Problem auf `~/.cache`); `git commit` braucht Bypass (GPG-Signierung).
- Auth ausschließlich per DRF-Token (`Authorization: Token <key>`); kein JWT, keine Session-Auth für die API.
- `quote_id` immer gegen `^\d{1,2}-\d{1,3}$` validieren (Muster `buch-abschnitt`, z. B. `5-23`).
- API-Fehlertexte bleiben Framework-Default (Englisch); die Clients übersetzen für die UI (Spec §7).
- Commits auf Deutsch im Conventional-Commit-Stil (`feat: …`, `test: …`), wie im aurelius-Repo üblich.
- `DEBUG=True` und SQLite sind für dieses Teilprojekt in Ordnung — Härtung/Postgres kommt in Teilprojekt 4 (Go-Live).

---

## Datei-Struktur (Endzustand)

```
aurelius-backend/
├── .gitignore
├── README.md
├── requirements.txt
├── manage.py
├── config/            # Projekt: settings.py, urls.py, wsgi.py, asgi.py
├── accounts/          # Custom User (E-Mail als Login), Admin, Tests
│   ├── models.py  admin.py  tests.py  migrations/
└── favorites/         # Favorite-Modell, API-Views, Tests
    ├── models.py  views.py  urls.py  admin.py  tests.py  migrations/
```

---

### Task 1: Projekt-Gerüst mit Custom-User (E-Mail als Login)

**Files:**
- Create: `aurelius-backend/` (git init), `.gitignore`, `requirements.txt`
- Create (generiert): `manage.py`, `config/*`, `accounts/*`
- Create: `accounts/models.py`, `accounts/admin.py`
- Test: `accounts/tests.py`

**Interfaces:**
- Produces: `accounts.User` (AUTH_USER_MODEL, `USERNAME_FIELD = "email"`, kein `username`-Feld) und Manager `User.objects.create_user(email=…, password=…)` / `create_superuser(…)`. Spätere Tasks referenzieren User ausschließlich über `settings.AUTH_USER_MODEL`.

**WICHTIG:** Das Custom-User-Modell MUSS vor der ersten Migration existieren — deshalb erst Modell schreiben, dann `migrate`.

- [ ] **Step 1: Verzeichnis, venv, Abhängigkeiten**

```bash
mkdir -p /home/x/Dokumente/Github/aurelius-backend
cd /home/x/Dokumente/Github/aurelius-backend
python3 -m venv .venv
cat > requirements.txt <<'EOF'
Django>=5.2,<6.0
djangorestframework>=3.16
dj-rest-auth>=7.0
django-allauth>=65.4
django-cors-headers>=4.7
EOF
.venv/bin/pip install --no-cache-dir -r requirements.txt
```

- [ ] **Step 2: Projekt und accounts-App generieren**

```bash
.venv/bin/django-admin startproject config .
.venv/bin/python manage.py startapp accounts
```

- [ ] **Step 3: Failing Test schreiben** — `accounts/tests.py` komplett ersetzen:

```python
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase


class UserModelTests(TestCase):
    def test_create_user_mit_email(self):
        user = get_user_model().objects.create_user(
            email="marc@example.com", password="stoa-am-limes-121"
        )
        self.assertEqual(user.email, "marc@example.com")
        self.assertTrue(user.check_password("stoa-am-limes-121"))
        self.assertFalse(user.is_staff)

    def test_email_ist_eindeutig(self):
        get_user_model().objects.create_user(email="marc@example.com", password="x1234567890")
        with self.assertRaises(IntegrityError):
            get_user_model().objects.create_user(email="marc@example.com", password="y1234567890")

    def test_create_superuser(self):
        admin = get_user_model().objects.create_superuser(
            email="admin@example.com", password="stoa-am-limes-121"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
```

- [ ] **Step 4: Test ausführen — muss fehlschlagen**

Run: `.venv/bin/python manage.py test accounts -v 2`
Expected: FAIL/ERROR (Default-User verlangt `username`; `create_user(email=…)` existiert so nicht)

- [ ] **Step 5: User-Modell implementieren** — `accounts/models.py` komplett ersetzen:

```python
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("E-Mail ist erforderlich")
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField("E-Mail-Adresse", unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
```

In `config/settings.py` ergänzen (`accounts` in `INSTALLED_APPS` aufnehmen, darunter):

```python
AUTH_USER_MODEL = "accounts.User"
```

- [ ] **Step 6: Admin registrieren** — `accounts/admin.py` komplett ersetzen:

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    ordering = ("email",)
    list_display = ("email", "is_staff", "date_joined")
    search_fields = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Berechtigungen", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Wichtige Daten", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)
```

- [ ] **Step 7: Migrationen und Test-Lauf**

```bash
.venv/bin/python manage.py makemigrations accounts
.venv/bin/python manage.py migrate
.venv/bin/python manage.py test accounts -v 2
```
Expected: 3 Tests PASS

- [ ] **Step 8: Git init und Commit**

```bash
cat > .gitignore <<'EOF'
.venv/
__pycache__/
*.pyc
db.sqlite3
.env
EOF
git init && git add -A
git commit -m "feat: Django-Grundgerüst mit E-Mail-Login-User"
```

---

### Task 2: Registrierung, E-Mail-Verifizierung, Login/Logout (Token)

**Files:**
- Modify: `config/settings.py`, `config/urls.py`
- Test: `accounts/tests.py` (Klasse ergänzen)

**Interfaces:**
- Consumes: `accounts.User` aus Task 1.
- Produces: Endpunkte `POST /api/auth/registration/` (Felder `email`, `password1`, `password2` → 201), `POST /api/auth/registration/verify-email/` (`{"key": …}` → 200), `POST /api/auth/login/` (`email`, `password` → `{"key": "<token>"}`), `POST /api/auth/logout/`, `GET /api/auth/user/`. Auth-Header für alle geschützten Aufrufe: `Authorization: Token <key>`.

- [ ] **Step 1: Failing Tests schreiben** — in `accounts/tests.py` anhängen:

```python
import re

from django.core import mail
from rest_framework.test import APIClient


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _register(self, email="marc@example.com"):
        return self.client.post("/api/auth/registration/", {
            "email": email,
            "password1": "stoa-am-limes-121",
            "password2": "stoa-am-limes-121",
        })

    def _verify_key_aus_mail(self):
        body = mail.outbox[-1].body
        return re.search(r"account-confirm-email/([-:\w]+)", body).group(1)

    def test_registrierung_sendet_verifizierungsmail(self):
        resp = self._register()
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["marc@example.com"])

    def test_login_vor_verifizierung_abgelehnt(self):
        self._register()
        resp = self.client.post("/api/auth/login/", {
            "email": "marc@example.com", "password": "stoa-am-limes-121",
        })
        self.assertEqual(resp.status_code, 400)

    def test_verifizieren_dann_login_liefert_token(self):
        self._register()
        resp = self.client.post("/api/auth/registration/verify-email/",
                                {"key": self._verify_key_aus_mail()})
        self.assertEqual(resp.status_code, 200)
        resp = self.client.post("/api/auth/login/", {
            "email": "marc@example.com", "password": "stoa-am-limes-121",
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn("key", resp.json())

    def test_user_endpoint_mit_token(self):
        self._register()
        self.client.post("/api/auth/registration/verify-email/",
                         {"key": self._verify_key_aus_mail()})
        token = self.client.post("/api/auth/login/", {
            "email": "marc@example.com", "password": "stoa-am-limes-121",
        }).json()["key"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        resp = self.client.get("/api/auth/user/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["email"], "marc@example.com")

    def test_logout_widerruft_token(self):
        self._register()
        self.client.post("/api/auth/registration/verify-email/",
                         {"key": self._verify_key_aus_mail()})
        token = self.client.post("/api/auth/login/", {
            "email": "marc@example.com", "password": "stoa-am-limes-121",
        }).json()["key"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 200)
        self.assertEqual(self.client.get("/api/auth/user/").status_code, 401)
```

- [ ] **Step 2: Tests ausführen — müssen fehlschlagen**

Run: `.venv/bin/python manage.py test accounts.tests.AuthApiTests -v 2`
Expected: FAIL (404 — die `/api/auth/…`-Routen existieren noch nicht)

- [ ] **Step 3: settings.py konfigurieren** — in `config/settings.py`:

`INSTALLED_APPS` ergänzen um:

```python
    "django.contrib.sites",
    "rest_framework",
    "rest_framework.authtoken",
    "allauth",
    "allauth.account",
    "dj_rest_auth",
    "dj_rest_auth.registration",
```

In `MIDDLEWARE` ans Ende anhängen (Pflicht für allauth ≥0.56):

```python
    "allauth.account.middleware.AccountMiddleware",
```

Am Dateiende anfügen:

```python
SITE_ID = 1

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.TokenAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"anon": "60/min"},
}

REST_AUTH = {
    "TOKEN_MODEL": "rest_framework.authtoken.models.Token",
    "SESSION_LOGIN": False,
}

# allauth ≥65: E-Mail-only-Konten
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_EMAIL_SUBJECT_PREFIX = "[Aurelius] "

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "aurelius@localhost"
```

- [ ] **Step 4: URLs verdrahten** — `config/urls.py` komplett ersetzen:

```python
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    # Nur für reverse() in den von allauth/Django erzeugten E-Mails —
    # die Links werden später von den Frontends bedient (Spec §4):
    re_path(
        r"^api/auth/registration/account-confirm-email/(?P<key>[-:\w]+)/$",
        TemplateView.as_view(template_name="platzhalter.html"),
        name="account_confirm_email",
    ),
    path(
        "api/auth/password/reset/confirm/<uidb64>/<token>/",
        TemplateView.as_view(template_name="platzhalter.html"),
        name="password_reset_confirm",
    ),
]
```

- [ ] **Step 5: Migrieren und Tests ausführen**

```bash
.venv/bin/python manage.py migrate
.venv/bin/python manage.py test accounts -v 2
```
Expected: alle Tests PASS (3 aus Task 1 + 5 neue)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Konten-API — Registrierung mit E-Mail-Verifizierung, Token-Login/-Logout"
```

---

### Task 3: Passwort-Reset per E-Mail

**Files:**
- Test: `accounts/tests.py` (Klasse ergänzen)
- Modify: keine neuen Routen nötig (kamen in Task 2 über `dj_rest_auth.urls`) — dieser Task beweist den Flow per Test.

**Interfaces:**
- Consumes: Endpunkte aus Task 2; `allauth.account.models.EmailAddress` für verifizierte Test-User.
- Produces: verifizierter Flow `POST /api/auth/password/reset/` (`{"email": …}`) → Mail mit `uid`/`token` → `POST /api/auth/password/reset/confirm/` (`uid`, `token`, `new_password1`, `new_password2`).

- [ ] **Step 1: Failing Test schreiben** — in `accounts/tests.py` anhängen:

```python
from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        user = get_user_model().objects.create_user(
            email="marc@example.com", password="alt-passwort-123"
        )
        EmailAddress.objects.create(user=user, email=user.email, primary=True, verified=True)

    def test_reset_flow_setzt_neues_passwort(self):
        resp = self.client.post("/api/auth/password/reset/", {"email": "marc@example.com"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        m = re.search(r"reset/confirm/([^/]+)/([^/\s]+)/", mail.outbox[0].body)
        self.assertIsNotNone(m)
        resp = self.client.post("/api/auth/password/reset/confirm/", {
            "uid": m.group(1),
            "token": m.group(2),
            "new_password1": "neu-und-lang-genug-9",
            "new_password2": "neu-und-lang-genug-9",
        })
        self.assertEqual(resp.status_code, 200)
        resp = self.client.post("/api/auth/login/", {
            "email": "marc@example.com", "password": "neu-und-lang-genug-9",
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn("key", resp.json())
```

- [ ] **Step 2: Test ausführen**

Run: `.venv/bin/python manage.py test accounts.tests.PasswordResetTests -v 2`
Expected: PASS (Routen existieren aus Task 2). Falls FAIL: Regex gegen den tatsächlichen Mail-Text aus der Testausgabe abgleichen und den Test-Regex korrigieren — nicht die Bibliothek umbauen.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: Passwort-Reset-Flow Ende-zu-Ende abgesichert"
```

---

### Task 4: Favoriten-App (Modell + API)

**Files:**
- Create: `favorites/` (startapp), `favorites/urls.py`
- Modify: `favorites/models.py`, `favorites/views.py`, `favorites/admin.py`, `config/settings.py` (App eintragen), `config/urls.py` (Route)
- Test: `favorites/tests.py`

**Interfaces:**
- Consumes: Token-Auth aus Task 2 (`Authorization: Token <key>`); `settings.AUTH_USER_MODEL`.
- Produces: `favorites.models.Favorite(user, quote_id, created_at)`; Endpunkte `GET /api/favorites/` → `[{"quote_id": "5-23", "created_at": "<ISO-8601>"}]`, `PUT /api/favorites/<quote_id>/` → 201 (neu) / 200 (schon vorhanden), `DELETE /api/favorites/<quote_id>/` → 204 (immer, idempotent). Die Clients (Teilprojekte 2/3) programmieren exakt gegen diese drei Endpunkte.

- [ ] **Step 1: App generieren und registrieren**

```bash
.venv/bin/python manage.py startapp favorites
```
In `config/settings.py` bei `INSTALLED_APPS` ergänzen: `"favorites",`

- [ ] **Step 2: Failing Tests schreiben** — `favorites/tests.py` komplett ersetzen:

```python
from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient


def _make_user(email):
    user = get_user_model().objects.create_user(email=email, password="stoa-am-limes-121")
    EmailAddress.objects.create(user=user, email=email, primary=True, verified=True)
    return user


class FavoritesApiTests(TestCase):
    def setUp(self):
        self.user = _make_user("marc@example.com")
        self.client = APIClient()
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=self.user).key}"
        )

    def test_ohne_token_401(self):
        self.assertEqual(APIClient().get("/api/favorites/").status_code, 401)

    def test_leere_liste(self):
        resp = self.client.get("/api/favorites/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), [])

    def test_put_legt_favorit_an(self):
        resp = self.client.put("/api/favorites/5-23/")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["quote_id"], "5-23")
        eintraege = self.client.get("/api/favorites/").json()
        self.assertEqual([e["quote_id"] for e in eintraege], ["5-23"])

    def test_put_ist_idempotent(self):
        self.client.put("/api/favorites/5-23/")
        resp = self.client.put("/api/favorites/5-23/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(self.client.get("/api/favorites/").json()), 1)

    def test_delete_entfernt_und_ist_idempotent(self):
        self.client.put("/api/favorites/5-23/")
        self.assertEqual(self.client.delete("/api/favorites/5-23/").status_code, 204)
        self.assertEqual(self.client.delete("/api/favorites/5-23/").status_code, 204)
        self.assertEqual(self.client.get("/api/favorites/").json(), [])

    def test_ungueltige_quote_id_400(self):
        for kaputt in ["abc", "1-", "-3", "123-1", "1-1234", "1-1x"]:
            resp = self.client.put(f"/api/favorites/{kaputt}/")
            self.assertEqual(resp.status_code, 400, kaputt)

    def test_userdaten_sind_getrennt(self):
        self.client.put("/api/favorites/5-23/")
        anderer = _make_user("kaiserin@example.com")
        client_b = APIClient()
        client_b.credentials(
            HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=anderer).key}"
        )
        self.assertEqual(client_b.get("/api/favorites/").json(), [])
        client_b.delete("/api/favorites/5-23/")
        self.assertEqual(len(self.client.get("/api/favorites/").json()), 1)
```

- [ ] **Step 3: Tests ausführen — müssen fehlschlagen**

Run: `.venv/bin/python manage.py test favorites -v 2`
Expected: FAIL (404 — Modell und Routen fehlen)

- [ ] **Step 4: Modell implementieren** — `favorites/models.py` komplett ersetzen:

```python
from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

QUOTE_ID_VALIDATOR = RegexValidator(
    regex=r"^\d{1,2}-\d{1,3}$",
    message="quote_id muss dem Muster buch-abschnitt entsprechen, z. B. 5-23",
)


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites"
    )
    quote_id = models.CharField(max_length=6, validators=[QUOTE_ID_VALIDATOR])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "quote_id"], name="unique_user_quote")
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} → {self.quote_id}"
```

- [ ] **Step 5: Views implementieren** — `favorites/views.py` komplett ersetzen:

```python
import re

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Favorite

QUOTE_ID_RE = re.compile(r"^\d{1,2}-\d{1,3}$")


def _serialisiere(favorit):
    return {"quote_id": favorit.quote_id, "created_at": favorit.created_at.isoformat()}


class FavoriteListView(APIView):
    def get(self, request):
        return Response([_serialisiere(f) for f in request.user.favorites.all()])


class FavoriteDetailView(APIView):
    def put(self, request, quote_id):
        if not QUOTE_ID_RE.match(quote_id):
            return Response(
                {"detail": "quote_id muss dem Muster buch-abschnitt entsprechen"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        favorit, neu = Favorite.objects.get_or_create(user=request.user, quote_id=quote_id)
        return Response(
            _serialisiere(favorit),
            status=status.HTTP_201_CREATED if neu else status.HTTP_200_OK,
        )

    def delete(self, request, quote_id):
        Favorite.objects.filter(user=request.user, quote_id=quote_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

- [ ] **Step 6: URLs** — `favorites/urls.py` neu anlegen:

```python
from django.urls import path

from .views import FavoriteDetailView, FavoriteListView

urlpatterns = [
    path("", FavoriteListView.as_view(), name="favorite-list"),
    path("<str:quote_id>/", FavoriteDetailView.as_view(), name="favorite-detail"),
]
```

In `config/urls.py` in `urlpatterns` ergänzen (vor den TemplateView-Einträgen):

```python
    path("api/favorites/", include("favorites.urls")),
```

- [ ] **Step 7: Admin** — `favorites/admin.py` komplett ersetzen:

```python
from django.contrib import admin

from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "quote_id", "created_at")
    search_fields = ("user__email", "quote_id")
```

- [ ] **Step 8: Migrieren, Tests ausführen**

```bash
.venv/bin/python manage.py makemigrations favorites
.venv/bin/python manage.py migrate
.venv/bin/python manage.py test -v 2
```
Expected: komplette Suite PASS (accounts + favorites)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: Favoriten-API — idempotentes Setzen/Entfernen, strikte quote_id-Validierung"
```

---

### Task 5: CORS und Rate-Limiting absichern

**Files:**
- Modify: `config/settings.py`
- Test: `favorites/tests.py` (Klassen ergänzen)

**Interfaces:**
- Consumes: Endpunkte aus Task 2/4.
- Produces: CORS-Freigabe exakt für `https://aurelius-rust.vercel.app` und lokale Dev-Origins; global 60 Anfragen/min für anonyme Aufrufer (Login-Bruteforce-Bremse).

- [ ] **Step 1: Failing Tests schreiben** — in `favorites/tests.py` anhängen:

```python
from django.core.cache import cache
from django.test import override_settings


class CorsTests(TestCase):
    def test_erlaubte_origin_bekommt_cors_header(self):
        resp = APIClient().get(
            "/api/favorites/", HTTP_ORIGIN="https://aurelius-rust.vercel.app"
        )
        self.assertEqual(
            resp["Access-Control-Allow-Origin"], "https://aurelius-rust.vercel.app"
        )

    def test_fremde_origin_bekommt_keinen_cors_header(self):
        resp = APIClient().get("/api/favorites/", HTTP_ORIGIN="https://boese-seite.example")
        self.assertNotIn("Access-Control-Allow-Origin", resp)


@override_settings(
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.TokenAuthentication"],
        "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
        "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle"],
        "DEFAULT_THROTTLE_RATES": {"anon": "3/min"},
    }
)
class ThrottleTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_anonyme_anfragen_werden_gedrosselt(self):
        client = APIClient()
        daten = {"email": "x@example.com", "password": "falsches-passwort"}
        for _ in range(3):
            client.post("/api/auth/login/", daten)
        self.assertEqual(client.post("/api/auth/login/", daten).status_code, 429)
```

- [ ] **Step 2: Tests ausführen — CORS-Tests müssen fehlschlagen**

Run: `.venv/bin/python manage.py test favorites.tests.CorsTests favorites.tests.ThrottleTests -v 2`
Expected: CorsTests FAIL (kein Header, corsheaders fehlt); ThrottleTests PASS (Throttle kam in Task 2) — falls ThrottleTests hier wider Erwarten FAIL zeigt, Ursache prüfen statt weiterzugehen.

- [ ] **Step 3: corsheaders konfigurieren** — in `config/settings.py`:

`INSTALLED_APPS` ergänzen um `"corsheaders",`. In `MIDDLEWARE` **direkt über** `"django.middleware.common.CommonMiddleware"` einfügen:

```python
    "corsheaders.middleware.CorsMiddleware",
```

Am Dateiende anfügen:

```python
CORS_ALLOWED_ORIGINS = [
    "https://aurelius-rust.vercel.app",  # Expo-Web (Produktion)
    "http://localhost:8081",             # Expo-Dev-Server
    "http://localhost:19006",            # Expo-Web-Dev (Legacy-Port)
]
```

- [ ] **Step 4: Komplette Suite ausführen**

Run: `.venv/bin/python manage.py test -v 2`
Expected: alle Tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: CORS-Allowlist und Anon-Rate-Limit"
```

---

### Task 6: README, Smoke-Test von Hand, Abschluss

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: alles Vorherige.
- Produces: dokumentierte Endpunkt-Tabelle als Vertrag für Teilprojekte 2 (Kotlin-App) und 3 (Web-Anbindung).

- [ ] **Step 1: README schreiben** — `README.md` neu anlegen:

```markdown
# aurelius-backend

Selbst gehostetes Backend für [Aurelius](https://github.com/…/aurelius):
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
```

- [ ] **Step 2: Smoke-Test von Hand** — Server starten und den echten Flow einmal per curl durchspielen:

```bash
.venv/bin/python manage.py runserver &
sleep 2
curl -s -X POST http://127.0.0.1:8000/api/auth/registration/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke@example.com","password1":"stoa-am-limes-121","password2":"stoa-am-limes-121"}'
# → 201; Verifizierungs-Mail erscheint in der runserver-Konsole.
# Key aus der Konsole kopieren, dann:
curl -s -X POST http://127.0.0.1:8000/api/auth/registration/verify-email/ \
  -H 'Content-Type: application/json' -d '{"key":"<KEY-AUS-KONSOLE>"}'
curl -s -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke@example.com","password":"stoa-am-limes-121"}'
# → {"key": "<TOKEN>"} — damit:
curl -s -X PUT http://127.0.0.1:8000/api/favorites/5-23/ -H 'Authorization: Token <TOKEN>'
curl -s http://127.0.0.1:8000/api/favorites/ -H 'Authorization: Token <TOKEN>'
kill %1
```
Expected: Registrierung 201, Verify 200, Login liefert Token, PUT 201, GET zeigt `5-23`.

- [ ] **Step 3: Finale Test-Suite und Commit**

```bash
.venv/bin/python manage.py test -v 2
git add -A
git commit -m "docs: README mit API-Vertrag und Dev-Anleitung"
```
