from django.contrib.auth.backends import ModelBackend

from .models import Utilisateur


class ConnexionBackend(ModelBackend):
    """Accepte un nom d’utilisateur ou une adresse e-mail."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        # Le nom d’utilisateur exact reste prioritaire.
        utilisateur = Utilisateur.objects.filter(username=username).first()
        if utilisateur is None:
            utilisateurs = list(Utilisateur.objects.filter(email__iexact=username)[:2])
            if not username or len(utilisateurs) != 1:
                # Même travail de hachage quand le compte n’est pas identifiable.
                Utilisateur().set_password(password)
                return None
            utilisateur = utilisateurs[0]

        return super().authenticate(
            request, username=utilisateur.username, password=password, **kwargs
        )
