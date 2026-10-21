from django.contrib.auth.models import AbstractUser


class Utilisateur(AbstractUser):
    """Compte commun ; les droits administrateur utilisent les permissions Django."""

    class Meta:
        verbose_name = 'utilisateur'
        verbose_name_plural = 'utilisateurs'
