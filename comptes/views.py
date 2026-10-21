from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods

from .forms import InscriptionForm


@login_required
def index(request):
    return render(request, "comptes/index.html")


@require_http_methods(["GET", "POST"])
def inscription(request):
    if request.user.is_authenticated:
        return redirect("comptes:index")

    if request.method == "POST":
        form = InscriptionForm(request.POST)
        if form.is_valid():
            # UserCreationForm enregistre le mot de passe sous forme hachée.
            form.save()
            messages.success(request, "Votre compte a été créé avec succès. Vous pouvez vous connecter.")
            return redirect("comptes:connexion")
    else:
        form = InscriptionForm()

    return render(request, "comptes/inscription.html", {"form": form})


@require_http_methods(["POST"])
def verifier_mot_de_passe(request):
    """Vérifie les règles Django sans créer ni enregistrer un utilisateur."""
    from django.contrib.auth.password_validation import get_default_password_validators
    from django.core.exceptions import ValidationError
    from django.http import JsonResponse
    from .models import Utilisateur

    utilisateur = Utilisateur(
        username=request.POST.get("username", ""),
        first_name=request.POST.get("first_name", ""),
        last_name=request.POST.get("last_name", ""),
        email=request.POST.get("email", ""),
    )
    password = request.POST.get("password1", "")
    resultats = []
    for validateur in get_default_password_validators():
        valide = bool(password)
        try:
            validateur.validate(password, utilisateur)
        except ValidationError:
            valide = False
        resultats.append({"texte": validateur.get_help_text(), "valide": valide})
    response = JsonResponse({"criteres": resultats})
    response["Cache-Control"] = "no-store"
    return response
