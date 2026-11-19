from django.contrib.auth.password_validation import get_default_password_validators
from django.core.exceptions import ValidationError
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import EstAdministrateur

from .models import Utilisateur
from .serializers import (
    ChangementMotDePasseSerializer,
    ConnexionSerializer,
    InscriptionSerializer,
    UtilisateurSerializer,
)


class InscriptionView(generics.CreateAPIView):
    """POST : créer un compte agriculteur."""

    serializer_class = InscriptionSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return Response(
                {"detail": "Vous êtes déjà connecté."}, status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class ConnexionView(TokenObtainPairView):
    """POST : connexion (nom d'utilisateur ou e-mail + mot de passe) → jetons JWT."""

    serializer_class = ConnexionSerializer


class DeconnexionView(APIView):
    """POST : invalide le jeton de rafraîchissement (liste noire)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            RefreshToken(request.data.get("refresh")).blacklist()
        except TokenError:
            return Response({"detail": "Jeton invalide."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)


class ProfilView(generics.RetrieveUpdateAPIView):
    """GET : voir son profil ; PATCH : modifier prénom, nom, e-mail."""

    serializer_class = UtilisateurSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch"]

    def get_object(self):
        return self.request.user


class ChangementMotDePasseView(generics.UpdateAPIView):
    """PUT : changer son mot de passe."""

    serializer_class = ChangementMotDePasseSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["put"]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response({"detail": "Mot de passe modifié."})


class VerificationMotDePasseView(APIView):
    """POST : vérifie les règles de mot de passe sans créer de compte (repris d'Ayoub)."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        utilisateur = Utilisateur(
            username=request.data.get("username", ""),
            first_name=request.data.get("first_name", ""),
            last_name=request.data.get("last_name", ""),
            email=request.data.get("email", ""),
        )
        mot_de_passe = request.data.get("password1", "")
        criteres = []
        for validateur in get_default_password_validators():
            valide = bool(mot_de_passe)
            try:
                validateur.validate(mot_de_passe, utilisateur)
            except ValidationError:
                valide = False
            criteres.append({"texte": validateur.get_help_text(), "valide": valide})
        reponse = Response({"criteres": criteres})
        reponse["Cache-Control"] = "no-store"
        return reponse


class UtilisateurListView(generics.ListAPIView):
    """GET : liste des comptes (réservée aux administrateurs)."""

    queryset = Utilisateur.objects.order_by("-date_joined")
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAuthenticated, EstAdministrateur]
