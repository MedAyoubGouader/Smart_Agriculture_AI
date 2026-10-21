from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

from .models import Utilisateur


class InscriptionForm(UserCreationForm):
    first_name = forms.CharField(label="Prénom", max_length=150, required=True)
    last_name = forms.CharField(label="Nom", max_length=150, required=True)
    email = forms.EmailField(label="Adresse e-mail", required=True)

    class Meta(UserCreationForm.Meta):
        model = Utilisateur
        fields = ["first_name", "last_name", "username", "email", "password1", "password2"]
        labels = {"username": "Nom d’utilisateur"}


class ConnexionForm(AuthenticationForm):
    username = forms.CharField(
        label="Nom d’utilisateur ou adresse e-mail",
        max_length=254,
        widget=forms.TextInput(attrs={"autofocus": True, "autocomplete": "username"}),
    )
    error_messages = {
        "invalid_login": "Identifiant ou mot de passe incorrect.",
        "inactive": "Ce compte est inactif.",
    }
