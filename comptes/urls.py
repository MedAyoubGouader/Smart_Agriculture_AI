from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path

from . import views
from .forms import ConnexionForm

app_name = "comptes"

urlpatterns = [
    path("verifier-mot-de-passe/", views.verifier_mot_de_passe, name="verifier_mot_de_passe"),
    path("", views.index, name="index"),
    path("connexion/", LoginView.as_view(
        template_name="comptes/connexion.html",
        authentication_form=ConnexionForm,
        redirect_authenticated_user=True,
    ), name="connexion"),
    path("deconnexion/", LogoutView.as_view(), name="deconnexion"),
    path("inscription/", views.inscription, name="inscription"),
]
