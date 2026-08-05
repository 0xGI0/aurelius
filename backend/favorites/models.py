from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

# Marc Aurel: "buch-abschnitt" (5-23) · Epiktet: "e-kapitel" (e-53)
QUOTE_ID_VALIDATOR = RegexValidator(
    regex=r"^(\d{1,2}-\d{1,3}|e-\d{1,2}|s-\d{1,2})$",
    message="quote_id muss dem Muster buch-abschnitt (5-23) oder e-kapitel (e-53) entsprechen",
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
