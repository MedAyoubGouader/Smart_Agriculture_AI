from django.test import Client, TestCase
from django.urls import reverse

from .models import Utilisateur


class InscriptionTests(TestCase):
    def setUp(self):
        self.url = reverse("comptes:inscription")
        self.donnees = {
            "first_name": "Mohamed Ayoub",
            "last_name": "Gouader",
            "username": "ayoub_test",
            "email": "ayoub@example.com",
            "password1": "Champ!Violet_7294",
            "password2": "Champ!Violet_7294",
        }

    def test_affichage_du_formulaire(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "csrfmiddlewaretoken")
        self.assertContains(response, 'name="first_name"')
        self.assertContains(response, 'name="last_name"')
        self.assertEqual(Utilisateur.objects.count(), 0)

    def test_creation_et_mot_de_passe_hache(self):
        # Les permissions envoyées par un visiteur doivent être ignorées.
        donnees = {**self.donnees, "is_staff": "True", "is_superuser": "True"}
        response = self.client.post(self.url, donnees, follow=True)
        self.assertRedirects(response, reverse("comptes:connexion"))
        self.assertContains(response, "Votre compte a été créé avec succès.")
        utilisateur = Utilisateur.objects.get(username="ayoub_test")
        self.assertEqual(utilisateur.email, "ayoub@example.com")
        self.assertEqual(utilisateur.first_name, "Mohamed Ayoub")
        self.assertEqual(utilisateur.last_name, "Gouader")
        self.assertTrue(utilisateur.check_password(self.donnees["password1"]))
        self.assertNotEqual(utilisateur.password, self.donnees["password1"])
        self.assertFalse(utilisateur.is_staff)
        self.assertFalse(utilisateur.is_superuser)
        self.assertNotIn("_auth_user_id", self.client.session)
        self.client.get(reverse("comptes:index"))
        self.assertEqual(Utilisateur.objects.count(), 1)

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
                response = self.client.post(self.url, {**self.donnees, **changements})
                self.assertEqual(response.status_code, 200)
                self.assertIn(champ, response.context["form"].errors)
                self.assertFalse(Utilisateur.objects.exists())

    def test_nom_utilisateur_deja_utilise(self):
        Utilisateur.objects.create_user(username="ayoub_test", password="Premier!7294")
        response = self.client.post(self.url, self.donnees)
        self.assertIn("username", response.context["form"].errors)
        self.assertEqual(Utilisateur.objects.count(), 1)

    def test_protection_csrf(self):
        client = Client(enforce_csrf_checks=True)
        self.assertEqual(client.post(self.url, self.donnees).status_code, 403)
        self.assertFalse(Utilisateur.objects.exists())
        client.get(self.url)
        response = client.post(
            self.url,
            {**self.donnees, "csrfmiddlewaretoken": client.cookies["csrftoken"].value},
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Utilisateur.objects.count(), 1)

    def test_utilisateur_connecte_ne_cree_pas_un_autre_compte(self):
        utilisateur = Utilisateur.objects.create_user(username="existant")
        self.client.force_login(utilisateur)
        response = self.client.post(self.url, self.donnees)
        self.assertRedirects(response, reverse("comptes:index"))
        self.assertEqual(Utilisateur.objects.count(), 1)


class AuthentificationTests(TestCase):
    def setUp(self):
        self.utilisateur = Utilisateur.objects.create_user(
            username="test_connexion", password="Champ!Violet_7294"
        )
        self.identifiants = {"username": "test_connexion", "password": "Champ!Violet_7294"}
        self.connexion = reverse("comptes:connexion")
        self.deconnexion = reverse("comptes:deconnexion")

    def test_pages_privees_et_carte_publique(self):
        self.assertEqual(self.client.get(reverse("cartographie:index")).status_code, 200)
        for nom in ["comptes:index", "analyses:index", "prediction:index"]:
            url = reverse(nom)
            self.assertRedirects(self.client.get(url), self.connexion + "?next=" + url)
        self.client.post(self.connexion, self.identifiants)
        for nom in ["comptes:index", "analyses:index", "prediction:index"]:
            self.assertEqual(self.client.get(reverse(nom)).status_code, 200)

    def test_connexion_et_redirection_interne(self):
        url = reverse("analyses:index")
        response = self.client.post(self.connexion, {**self.identifiants, "next": url})
        self.assertRedirects(response, url)
        self.assertEqual(int(self.client.session["_auth_user_id"]), self.utilisateur.pk)

    def test_refus_redirection_externe(self):
        response = self.client.post(self.connexion, {**self.identifiants, "next": "https://example.com"})
        self.assertRedirects(response, reverse("comptes:index"))

    def test_mauvais_identifiants_et_compte_inactif(self):
        response = self.client.post(self.connexion, {**self.identifiants, "password": "incorrect"})
        self.assertTrue(response.context["form"].non_field_errors())
        self.assertNotIn("_auth_user_id", self.client.session)
        self.utilisateur.is_active = False
        self.utilisateur.save()
        response = self.client.post(self.connexion, self.identifiants)
        self.assertTrue(response.context["form"].non_field_errors())
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_deconnexion_post_seulement_et_fin_session(self):
        self.client.post(self.connexion, self.identifiants)
        self.assertEqual(self.client.get(self.deconnexion).status_code, 405)
        self.assertIn("_auth_user_id", self.client.session)
        response = self.client.post(self.deconnexion)
        self.assertRedirects(response, self.connexion)
        self.assertNotIn("_auth_user_id", self.client.session)
        self.assertEqual(self.client.get(reverse("analyses:index")).status_code, 302)

    def test_csrf_connexion_et_deconnexion(self):
        client = Client(enforce_csrf_checks=True)
        self.assertEqual(client.post(self.connexion, self.identifiants).status_code, 403)
        client.get(self.connexion)
        response = client.post(self.connexion, {
            **self.identifiants, "csrfmiddlewaretoken": client.cookies["csrftoken"].value,
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(client.post(self.deconnexion).status_code, 403)
        response = client.post(self.deconnexion, {
            "csrfmiddlewaretoken": client.cookies["csrftoken"].value,
        })
        self.assertRedirects(response, self.connexion)


class VerificationMotDePasseTests(TestCase):
    def test_regles_et_absence_enregistrement(self):
        url = reverse("comptes:verifier_mot_de_passe")
        for password, valide in [("", False), ("123", False), ("password", False), ("Champ!Violet_7294", True)]:
            response = self.client.post(url, {"password1": password})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(all(r["valide"] for r in response.json()["criteres"]), valide)
        response = self.client.post(url, {"password1": "Champ!Violet_7294", "username": "Champ!Violet_7294"})
        self.assertFalse(all(r["valide"] for r in response.json()["criteres"]))
        self.assertEqual(Utilisateur.objects.count(), 0)
        self.assertEqual(self.client.get(url).status_code, 405)
        self.assertEqual(Client(enforce_csrf_checks=True).post(url, {"password1": "test"}).status_code, 403)


class ConnexionEmailTests(TestCase):
    def setUp(self):
        self.url = reverse("comptes:connexion")
        self.utilisateur = Utilisateur.objects.create_user(
            username="agriculteur", email="ayoub@example.com", password="Champ!Violet_7294"
        )

    def test_nom_et_email_sans_distinction_de_casse(self):
        for identifiant in ["agriculteur", "ayoub@example.com", "AYOUB@EXAMPLE.COM"]:
            self.client.logout()
            response = self.client.post(self.url, {
                "username": identifiant, "password": "Champ!Violet_7294",
            })
            self.assertRedirects(response, reverse("comptes:index"))
            self.assertEqual(int(self.client.session["_auth_user_id"]), self.utilisateur.pk)

    def test_email_incorrect_mot_de_passe_incorrect_et_compte_inactif(self):
        for identifiant, password in [("inconnu@example.com", "Champ!Violet_7294"), ("ayoub@example.com", "incorrect")]:
            response = self.client.post(self.url, {"username": identifiant, "password": password})
            self.assertTrue(response.context["form"].errors)
            self.assertNotIn("_auth_user_id", self.client.session)
        self.utilisateur.is_active = False
        self.utilisateur.save()
        self.client.post(self.url, {"username": "ayoub@example.com", "password": "Champ!Violet_7294"})
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_email_partage_refuse_et_nom_reste_utilisable(self):
        Utilisateur.objects.create_user(username="autre", email="AYOUB@example.com", password="Autre!7294")
        self.client.post(self.url, {"username": "ayoub@example.com", "password": "Champ!Violet_7294"})
        self.assertNotIn("_auth_user_id", self.client.session)
        response = self.client.post(self.url, {"username": "agriculteur", "password": "Champ!Violet_7294"})
        self.assertRedirects(response, reverse("comptes:index"))
