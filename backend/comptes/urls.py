from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangementMotDePasseView,
    ConnexionView,
    DeconnexionView,
    InscriptionView,
    ProfilView,
    UtilisateurListView,
    VerificationMotDePasseView,
)

app_name = "comptes"

# domain.com/api/comptes/...
urlpatterns = [
    path("inscription/", InscriptionView.as_view(), name="inscription"),
    path("verifier-mot-de-passe/", VerificationMotDePasseView.as_view(), name="verifier_mot_de_passe"),
    path("connexion/", ConnexionView.as_view(), name="connexion"),
    path("jeton/rafraichir/", TokenRefreshView.as_view(), name="rafraichir_jeton"),
    path("deconnexion/", DeconnexionView.as_view(), name="deconnexion"),
    path("profil/", ProfilView.as_view(), name="profil"),
    path("profil/mot-de-passe/", ChangementMotDePasseView.as_view(), name="mot_de_passe"),
    path("utilisateurs/", UtilisateurListView.as_view(), name="utilisateurs"),
]
