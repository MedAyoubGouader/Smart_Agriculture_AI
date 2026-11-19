"""Tests de l'app comptes — transposés des tests MVT d'Ayoub vers l'API REST (mêmes cas, mêmes données)."""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Utilisateur

MOT_DE_PASSE = "Champ!Violet_7294"


class InscriptionTests(APITestCase):
    def setUp(self):
        self.url = reverse("comptes:inscription")
        self.donnees = {
            "first_name": "Mohamed Ayoub",
            "last_name": "Gouader",
            "username": "ayoub_test",
            "email": "ayoub@example.com",
            "password1": MOT_DE_PASSE,
            "password2": MOT_DE_PASSE,
        }

    def test_creation_et_mot_de_passe_hache(self):
        # Les permissions et le rôle envoyés par un visiteur doivent être ignorés.
        donnees = {**self.donnees, "is_staff": True, "is_superuser": True, "role": "admin"}
        response = self.client.post(self.url, donnees, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password1", response.data)
        utilisateur = Utilisateur.objects.get(username="ayoub_test")
        self.assertEqual(utilisateur.email, "ayoub@example.com")
        self.assertEqual(utilisateur.first_name, "Mohamed Ayoub")
        self.assertEqual(utilisateur.last_name, "Gouader")
        self.assertTrue(utilisateur.check_password(MOT_DE_PASSE))
        self.assertNotEqual(utilisateur.password, MOT_DE_PASSE)
        self.assertFalse(utilisateur.is_staff)
        self.assertFalse(utilisateur.is_superuser)
        self.assertEqual(utilisateur.role, Utilisateur.Role.AGRICULTEUR)

    def test_donnees_invalides(self):
        cas = [
            ({"first_name": ""}, "first_name"),
            ({"last_name": "   "}, "last_name"),
            ({"first_name": "a" * 151}, "first_name"),
            ({"last_name": "a" * 151}, "last_name"),
            ({"username": ""}, "username"),
            ({"username": "nom invalide!"}, "username"),
            ({"email": "incorrect"}, "email"),
            ({"email": ""}, "email"),
            ({"password2": "AutreMotDePasse!82"}, "password2"),
            ({"password1": "123", "password2": "123"}, "password2"),
            ({"password1": "password", "password2": "password"}, "password2"),
        ]
        for changements, champ in cas:
            with self.subTest(changements=changements):
                response = self.client.post(self.url, {**self.donnees, **changements}, format="json")
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn(champ, response.data)
                self.assertFalse(Utilisateur.objects.exists())

    def test_nom_utilisateur_deja_utilise(self):
        Utilisateur.objects.create_user(username="ayoub_test", password="Premier!7294")
        response = self.client.post(self.url, self.donnees, format="json")
        self.assertIn("username", response.data)
        self.assertEqual(Utilisateur.objects.count(), 1)

    def test_email_deja_utilise(self):
        Utilisateur.objects.create_user(username="autre", email="AYOUB@example.com", password="Premier!7294")
        response = self.client.post(self.url, self.donnees, format="json")
        self.assertIn("email", response.data)
        self.assertEqual(Utilisateur.objects.count(), 1)

    def test_utilisateur_connecte_ne_cree_pas_un_autre_compte(self):
        utilisateur = Utilisateur.objects.create_user(username="existant")
        self.client.force_authenticate(utilisateur)
        response = self.client.post(self.url, self.donnees, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Utilisateur.objects.count(), 1)


class AuthentificationTests(APITestCase):
    def setUp(self):
        self.utilisateur = Utilisateur.objects.create_user(
            username="test_connexion", email="test@example.com", password=MOT_DE_PASSE
        )
        self.identifiants = {"username": "test_connexion", "password": MOT_DE_PASSE}
        self.connexion = reverse("comptes:connexion")
        self.profil = reverse("comptes:profil")

    def se_connecter(self):
        response = self.client.post(self.connexion, self.identifiants, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response.data

    def test_connexion_renvoie_jetons_et_profil(self):
        donnees = self.se_connecter()
        self.assertIn("access", donnees)
        self.assertIn("refresh", donnees)
        self.assertEqual(donnees["utilisateur"]["username"], "test_connexion")
        self.assertEqual(donnees["utilisateur"]["role"], "agriculteur")

    def test_route_privee_sans_jeton_et_route_publique(self):
        self.assertEqual(self.client.get(self.profil).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(reverse("health")).status_code, status.HTTP_200_OK)
        self.se_connecter()
        self.assertEqual(self.client.get(self.profil).status_code, status.HTTP_200_OK)

    def test_mauvais_identifiants_et_compte_inactif(self):
        response = self.client.post(
            self.connexion, {**self.identifiants, "password": "incorrect"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["detail"], "Identifiant ou mot de passe incorrect.")
        self.utilisateur.is_active = False
        self.utilisateur.save()
        response = self.client.post(self.connexion, self.identifiants, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_deconnexion_invalide_le_jeton_de_rafraichissement(self):
        donnees = self.se_connecter()
        deconnexion = reverse("comptes:deconnexion")
        self.assertEqual(self.client.get(deconnexion).status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        response = self.client.post(deconnexion, {"refresh": donnees["refresh"]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        response = self.client.post(
            reverse("comptes:rafraichir_jeton"), {"refresh": donnees["refresh"]}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_rafraichissement_du_jeton(self):
        donnees = self.se_connecter()
        response = self.client.post(
            reverse("comptes:rafraichir_jeton"), {"refresh": donnees["refresh"]}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


class ConnexionEmailTests(APITestCase):
    def setUp(self):
        self.url = reverse("comptes:connexion")
        self.utilisateur = Utilisateur.objects.create_user(
            username="agriculteur", email="ayoub@example.com", password=MOT_DE_PASSE
        )

    def connexion(self, identifiant, password=MOT_DE_PASSE):
        return self.client.post(self.url, {"username": identifiant, "password": password}, format="json")

    def test_nom_et_email_sans_distinction_de_casse(self):
        for identifiant in ["agriculteur", "ayoub@example.com", "AYOUB@EXAMPLE.COM"]:
            with self.subTest(identifiant=identifiant):
                response = self.connexion(identifiant)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(response.data["utilisateur"]["id"], self.utilisateur.pk)

    def test_email_incorrect_mot_de_passe_incorrect_et_compte_inactif(self):
        for identifiant, password in [("inconnu@example.com", MOT_DE_PASSE), ("ayoub@example.com", "incorrect")]:
            self.assertEqual(self.connexion(identifiant, password).status_code, status.HTTP_401_UNAUTHORIZED)
        self.utilisateur.is_active = False
        self.utilisateur.save()
        self.assertEqual(self.connexion("ayoub@example.com").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_email_partage_refuse_et_nom_reste_utilisable(self):
        Utilisateur.objects.create_user(username="autre", email="AYOUB@example.com", password="Autre!7294")
        self.assertEqual(self.connexion("ayoub@example.com").status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.connexion("agriculteur").status_code, status.HTTP_200_OK)


class VerificationMotDePasseTests(APITestCase):
    def test_regles_et_absence_enregistrement(self):
        url = reverse("comptes:verifier_mot_de_passe")
        for password, valide in [("", False), ("123", False), ("password", False), (MOT_DE_PASSE, True)]:
            with self.subTest(password=password):
                response = self.client.post(url, {"password1": password}, format="json")
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(all(r["valide"] for r in response.data["criteres"]), valide)
        response = self.client.post(url, {"password1": MOT_DE_PASSE, "username": MOT_DE_PASSE}, format="json")
        self.assertFalse(all(r["valide"] for r in response.data["criteres"]))
        self.assertEqual(Utilisateur.objects.count(), 0)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class ProfilTests(APITestCase):
    def setUp(self):
        self.utilisateur = Utilisateur.objects.create_user(
            username="fellah", email="fellah@example.com", password=MOT_DE_PASSE,
            first_name="Ali", last_name="Ben Salah",
        )
        Utilisateur.objects.create_user(username="voisin", email="voisin@example.com")
        self.client.force_authenticate(self.utilisateur)
        self.url = reverse("comptes:profil")

    def test_lecture_et_modification(self):
        self.assertEqual(self.client.get(self.url).data["first_name"], "Ali")
        response = self.client.patch(self.url, {"first_name": "Aly", "role": "admin"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.utilisateur.refresh_from_db()
        self.assertEqual(self.utilisateur.first_name, "Aly")
        self.assertEqual(self.utilisateur.role, Utilisateur.Role.AGRICULTEUR)  # rôle non modifiable

    def test_email_deja_pris_par_un_autre(self):
        response = self.client.patch(self.url, {"email": "VOISIN@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_changement_mot_de_passe(self):
        url = reverse("comptes:mot_de_passe")
        nouveau = "Olivier#Sfax_2026"
        mauvais = {"ancien_mot_de_passe": "faux", "nouveau_mot_de_passe1": nouveau, "nouveau_mot_de_passe2": nouveau}
        self.assertEqual(self.client.put(url, mauvais, format="json").status_code, status.HTTP_400_BAD_REQUEST)
        faible = {"ancien_mot_de_passe": MOT_DE_PASSE, "nouveau_mot_de_passe1": "123", "nouveau_mot_de_passe2": "123"}
        self.assertIn("nouveau_mot_de_passe2", self.client.put(url, faible, format="json").data)
        bon = {"ancien_mot_de_passe": MOT_DE_PASSE, "nouveau_mot_de_passe1": nouveau, "nouveau_mot_de_passe2": nouveau}
        self.assertEqual(self.client.put(url, bon, format="json").status_code, status.HTTP_200_OK)
        self.utilisateur.refresh_from_db()
        self.assertTrue(self.utilisateur.check_password(nouveau))


class RolesTests(APITestCase):
    def setUp(self):
        self.url = reverse("comptes:utilisateurs")

    def test_liste_reservee_aux_administrateurs(self):
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_401_UNAUTHORIZED)
        agriculteur = Utilisateur.objects.create_user(username="agri")
        self.client.force_authenticate(agriculteur)
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_403_FORBIDDEN)
        admin = Utilisateur.objects.create_user(username="chef", role=Utilisateur.Role.ADMIN)
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_200_OK)

    def test_superutilisateur_est_administrateur(self):
        superuser = Utilisateur.objects.create_superuser(username="super", password=MOT_DE_PASSE)
        self.assertEqual(superuser.role, Utilisateur.Role.ADMIN)
