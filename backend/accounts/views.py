from allauth.account.forms import default_token_generator as allauth_token_generator
from allauth.account.models import EmailConfirmationHMAC
from allauth.account.utils import url_str_to_user_pk
from django.contrib.auth import get_user_model
from django.contrib.auth.views import PasswordResetConfirmView
from django.shortcuts import render


def confirm_email_view(request, key):
    """Bestätigt die E-Mail direkt beim Öffnen des Mail-Links —
    funktioniert damit für Web- und App-Nutzer ohne Frontend-Routing."""
    confirmation = EmailConfirmationHMAC.from_key(key)
    ok = confirmation is not None
    if ok:
        confirmation.confirm(request)
    return render(request, "accounts/confirmed.html", {"ok": ok}, status=200 if ok else 400)


class AllauthUidResetConfirmView(PasswordResetConfirmView):
    """dj-rest-auth erzeugt uid UND Token im allauth-Format —
    beides hier entsprechend dekodieren/prüfen."""

    token_generator = allauth_token_generator

    def get_user(self, uidb64):
        UserModel = get_user_model()
        try:
            return UserModel._default_manager.get(pk=url_str_to_user_pk(uidb64))
        except (UserModel.DoesNotExist, ValueError, TypeError, OverflowError):
            return None
