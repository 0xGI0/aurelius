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


import re

from django.core import mail
from django.core.cache import cache
from rest_framework.test import APIClient


class AuthApiTests(TestCase):
    def setUp(self):
        # allauths Mail-Rate-Limit (1 Bestätigungsmail/Adresse/3min) lebt im
        # Cache und überlebt Test-Rollbacks — für deterministische Tests leeren:
        cache.clear()
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


from allauth.account.models import EmailAddress


class PasswordResetTests(TestCase):
    def setUp(self):
        cache.clear()
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
