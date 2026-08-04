from dj_rest_auth.registration.serializers import RegisterSerializer


class EmailRegisterSerializer(RegisterSerializer):
    """Registrierung ohne username — Konten laufen rein über E-Mail."""

    username = None
