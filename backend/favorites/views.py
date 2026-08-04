import re

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Favorite

QUOTE_ID_RE = re.compile(r"^\d{1,2}-\d{1,3}$")


def _serialisiere(favorit):
    return {"quote_id": favorit.quote_id, "created_at": favorit.created_at.isoformat()}


class FavoriteListView(APIView):
    def get(self, request):
        return Response([_serialisiere(f) for f in request.user.favorites.all()])


class FavoriteDetailView(APIView):
    def put(self, request, quote_id):
        if not QUOTE_ID_RE.match(quote_id):
            return Response(
                {"detail": "quote_id muss dem Muster buch-abschnitt entsprechen"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        favorit, neu = Favorite.objects.get_or_create(user=request.user, quote_id=quote_id)
        return Response(
            _serialisiere(favorit),
            status=status.HTTP_201_CREATED if neu else status.HTTP_200_OK,
        )

    def delete(self, request, quote_id):
        Favorite.objects.filter(user=request.user, quote_id=quote_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
