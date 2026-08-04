from django.contrib import admin

from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "quote_id", "created_at")
    search_fields = ("user__email", "quote_id")
