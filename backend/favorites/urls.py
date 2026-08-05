from django.urls import path

from .views import FavoriteDetailView, FavoriteListView

urlpatterns = [
    path("", FavoriteListView.as_view(), name="favorite-list"),
    path("<str:quote_id>/", FavoriteDetailView.as_view(), name="favorite-detail"),
]
