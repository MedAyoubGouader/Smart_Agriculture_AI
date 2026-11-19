"""
Seeder du compte administrateur : python manage.py creer_admin

Les identifiants sont lus dans le .env (ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD) ou passés en options.
La commande peut être relancée sans risque : le compte est créé s'il n'existe pas, sinon mis à jour.
"""

import environ
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError

from comptes.models import Utilisateur

env = environ.Env()


class Command(BaseCommand):
    help = "Crée (ou met à jour) le compte administrateur de la plateforme à partir du .env."

    def add_arguments(self, parser):
        parser.add_argument("--username", help="Nom d'utilisateur (défaut : ADMIN_USERNAME du .env, sinon « admin »)")
        parser.add_argument("--email", help="Adresse e-mail (défaut : ADMIN_EMAIL du .env)")
        parser.add_argument("--password", help="Mot de passe (défaut : ADMIN_PASSWORD du .env)")

    def handle(self, *args, **options):
        environ.Env.read_env(settings.PROJECT_DIR / ".env")
        username = options["username"] or env("ADMIN_USERNAME", default="admin")
        email = options["email"] or env("ADMIN_EMAIL", default="")
        password = options["password"] or env("ADMIN_PASSWORD", default="")

        if not password:
            raise CommandError("Mot de passe manquant : renseigner ADMIN_PASSWORD dans le .env (ou --password).")

        utilisateur = Utilisateur.objects.filter(username=username).first()
        cree = utilisateur is None
        if cree:
            utilisateur = Utilisateur(username=username)

        # Mêmes règles de mot de passe que pour les autres comptes.
        try:
            validate_password(password, utilisateur)
        except ValidationError as erreur:
            raise CommandError("Mot de passe refusé : " + " ".join(erreur.messages)) from erreur

        utilisateur.email = email or utilisateur.email
        utilisateur.first_name = utilisateur.first_name or "Administrateur"
        utilisateur.is_staff = True
        utilisateur.is_superuser = True  # le modèle lui donne alors le rôle « admin »
        utilisateur.is_active = True
        utilisateur.set_password(password)
        utilisateur.save()

        action = "créé" if cree else "mis à jour"
        self.stdout.write(self.style.SUCCESS(
            f"Administrateur « {utilisateur.username} » {action} (rôle : {utilisateur.get_role_display()})."
        ))
