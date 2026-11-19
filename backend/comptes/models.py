from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):
    """Compte commun (modèle d'Ayoub) avec un rôle : agriculteur ou administrateur."""

    class Role(models.TextChoices):
        AGRICULTEUR = "agriculteur", "Agriculteur"
        ADMIN = "admin", "Administrateur"

    role = models.CharField(
        "rôle", max_length=20, choices=Role.choices, default=Role.AGRICULTEUR
    )

    class Meta:
        verbose_name = "utilisateur"
        verbose_name_plural = "utilisateurs"

    def save(self, *args, **kwargs):
        # Un superutilisateur (createsuperuser) est toujours administrateur de la plateforme.
        if self.is_superuser:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)

    @property
    def est_admin(self):
        return self.role == self.Role.ADMIN

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
