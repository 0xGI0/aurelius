from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView

from accounts.views import AllauthUidResetConfirmView, confirm_email_view

urlpatterns = [
    path("admin/", admin.site.urls),
    # Mail-Links VOR den dj-rest-auth-Includes (die registrieren eigene
    # Platzhalter unter demselben Pfad): bestätigen direkt im Browser.
    re_path(
        r"^api/auth/registration/account-confirm-email/(?P<key>[-:\w]+)/$",
        confirm_email_view,
        name="account_confirm_email",
    ),
    path(
        "api/auth/password/reset/confirm/<uidb64>/<token>/",
        AllauthUidResetConfirmView.as_view(
            template_name="accounts/reset_form.html",
            success_url="/api/auth/password/reset/done/",
        ),
        name="password_reset_confirm",
    ),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/favorites/", include("favorites.urls")),
    path(
        "api/auth/password/reset/done/",
        TemplateView.as_view(template_name="accounts/reset_done.html"),
        name="password_reset_done",
    ),
]
