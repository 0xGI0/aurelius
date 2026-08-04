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
