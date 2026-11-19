from rest_framework.permissions import BasePermission


class EstAdministrateur(BasePermission):
    """Autorise seulement les utilisateurs connectés ayant le rôle administrateur."""

    message = "Accès réservé aux administrateurs."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.est_admin)
