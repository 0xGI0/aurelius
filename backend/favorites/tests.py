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
        for kaputt in ["abc", "1-", "-3", "123-1", "1-1234", "1-1x", "e-", "e-123", "x-5", "e-5x"]:
            resp = self.client.put(f"/api/favorites/{kaputt}/")
            self.assertEqual(resp.status_code, 400, kaputt)

    def test_epiktet_ids_werden_akzeptiert(self):
        resp = self.client.put("/api/favorites/e-53/")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["quote_id"], "e-53")
        ids = [e["quote_id"] for e in self.client.get("/api/favorites/").json()]
        self.assertIn("e-53", ids)

    def test_seneca_ids_werden_akzeptiert(self):
        resp = self.client.put("/api/favorites/s-20/")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(self.client.put("/api/favorites/s-123/").status_code, 400)

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


# DRF brennt Throttle-Raten beim Import ein — override_settings(REST_FRAMEWORK=…)
# greift nicht. Wir testen deshalb gegen die echte Rate (60/min) und beschleunigen
# das Passwort-Hashing, damit 61 Login-Versuche nicht Minuten dauern.
@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class ThrottleTests(TestCase):
    def setUp(self):
        cache.clear()

    def test_anonyme_anfragen_werden_gedrosselt(self):
        client = APIClient()
        daten = {"email": "x@example.com", "password": "falsches-passwort"}
        stati = [client.post("/api/auth/login/", daten).status_code for _ in range(61)]
        self.assertNotIn(429, stati[:5])  # die ersten Versuche laufen durch
        self.assertEqual(stati[-1], 429)  # ab der 61. Anfrage/min ist Schluss
