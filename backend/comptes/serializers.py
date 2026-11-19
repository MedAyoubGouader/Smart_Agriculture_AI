from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Utilisateur


def _verifier_mot_de_passe(mot_de_passe, utilisateur, champ):
    """Applique les règles de mot de passe de Django (AUTH_PASSWORD_VALIDATORS)."""
    try:
        password_validation.validate_password(mot_de_passe, utilisateur)
    except DjangoValidationError as erreur:
        raise serializers.ValidationError({champ: list(erreur.messages)})


class InscriptionSerializer(serializers.ModelSerializer):
    """Équivalent API de InscriptionForm (Ayoub) : mêmes champs, mêmes règles."""

    first_name = serializers.CharField(label="Prénom", max_length=150)
    last_name = serializers.CharField(label="Nom", max_length=150)
    email = serializers.EmailField(label="Adresse e-mail")
    password1 = serializers.CharField(label="Mot de passe", write_only=True, trim_whitespace=False)
    password2 = serializers.CharField(
        label="Confirmation du mot de passe", write_only=True, trim_whitespace=False
    )

    class Meta:
        model = Utilisateur
        fields = ["id", "first_name", "last_name", "username", "email", "password1", "password2"]
        read_only_fields = ["id"]

    def validate_email(self, valeur):
        if Utilisateur.objects.filter(email__iexact=valeur).exists():
            raise serializers.ValidationError("Un compte utilise déjà cette adresse e-mail.")
        return valeur

    def validate(self, donnees):
        if donnees["password1"] != donnees["password2"]:
            raise serializers.ValidationError(
                {"password2": "Les deux mots de passe ne correspondent pas."}
            )
        utilisateur = Utilisateur(
            username=donnees.get("username", ""),
            first_name=donnees.get("first_name", ""),
            last_name=donnees.get("last_name", ""),
            email=donnees.get("email", ""),
        )
        _verifier_mot_de_passe(donnees["password1"], utilisateur, "password2")
        return donnees

    def create(self, donnees):
        mot_de_passe = donnees.pop("password1")
        donnees.pop("password2")
        # Le rôle n'est jamais choisi par le visiteur : toujours agriculteur ; mot de passe haché.
        return Utilisateur.objects.create_user(
            password=mot_de_passe, role=Utilisateur.Role.AGRICULTEUR, **donnees
        )


class UtilisateurSerializer(serializers.ModelSerializer):
    """Profil de l'utilisateur connecté."""

    role_libelle = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "role", "role_libelle", "date_joined",
        ]
        read_only_fields = ["id", "username", "role", "role_libelle", "date_joined"]
        extra_kwargs = {
            "first_name": {"required": True, "allow_blank": False},
            "last_name": {"required": True, "allow_blank": False},
            "email": {"required": True, "allow_blank": False},
        }

    def validate_email(self, valeur):
        deja_pris = Utilisateur.objects.filter(email__iexact=valeur).exclude(pk=self.instance.pk)
        if deja_pris.exists():
            raise serializers.ValidationError("Un compte utilise déjà cette adresse e-mail.")
        return valeur


class ChangementMotDePasseSerializer(serializers.Serializer):
    ancien_mot_de_passe = serializers.CharField(write_only=True, trim_whitespace=False)
    nouveau_mot_de_passe1 = serializers.CharField(write_only=True, trim_whitespace=False)
    nouveau_mot_de_passe2 = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_ancien_mot_de_passe(self, valeur):
        if not self.instance.check_password(valeur):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return valeur

    def validate(self, donnees):
        if donnees["nouveau_mot_de_passe1"] != donnees["nouveau_mot_de_passe2"]:
            raise serializers.ValidationError(
                {"nouveau_mot_de_passe2": "Les deux mots de passe ne correspondent pas."}
            )
        _verifier_mot_de_passe(donnees["nouveau_mot_de_passe1"], self.instance, "nouveau_mot_de_passe2")
        return donnees

    def update(self, utilisateur, donnees):
        utilisateur.set_password(donnees["nouveau_mot_de_passe1"])
        utilisateur.save()
        return utilisateur


class ConnexionSerializer(TokenObtainPairSerializer):
    """Connexion par nom d'utilisateur ou e-mail (ConnexionBackend) ; renvoie les jetons JWT + le profil."""

    default_error_messages = {
        "no_active_account": "Identifiant ou mot de passe incorrect.",
    }

    @classmethod
    def get_token(cls, utilisateur):
        jeton = super().get_token(utilisateur)
        jeton["role"] = utilisateur.role
        return jeton

    def validate(self, donnees):
        resultat = super().validate(donnees)
        resultat["utilisateur"] = UtilisateurSerializer(self.user).data
        return resultat
