from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/favorites/", include("favorites.urls")),
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
