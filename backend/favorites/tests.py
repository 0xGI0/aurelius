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
