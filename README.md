# Smart Agriculture Tunisia

Projet Django — Mohamed Ayoub Gouader, Omar Cherif et Hajer Aroui.

## Dossiers

| Dossier | Utilité |
|---|---|
| config | Configuration générale et URLs du projet |
| comptes | Comptes et permissions — Ayoub |
| analyses | Historique et comparaison — Ayoub |
| referentiels | Gouvernorats, cultures, saisons — Hajer |
| donnees | Import et historique des données — Hajer |
| cartographie | Carte et fiches régionales — Hajer |
| prediction | Entraînement et prédiction ML — Omar |
| .venv | Bibliothèques Python locales, exclues de Git |

Dans chaque application, models.py décrit les données, views.py traite les requêtes,
admin.py configure l’administration et migrations conserve les changements de base.
Ces fichiers sont créés normalement par Django.
Chaque application possède aussi son urls.py, son dossier templates/nom_application/
et son dossier static/nom_application/. Le second niveau évite les collisions de noms.
APP_DIRS=True permet à Django de trouver les pages dans les applications.

Le socle contient un utilisateur personnalisable et les trois référentiels.
Les fonctionnalités du site restent à développer. Aucun compte administrateur n’est créé par défaut.

## Sur ce PC

Ouvrir un terminal dans ce dossier :

```powershell
.\.venv\Scripts\python.exe manage.py runserver
```

Ouvrir http://127.0.0.1:8000/ (redirige vers la page de cartographie).
Pour créer son administrateur :

```powershell
.\.venv\Scripts\python.exe manage.py createsuperuser
```

Administration : http://127.0.0.1:8000/admin/

Pages de départ : /carte/, /comptes/, /referentiels/, /donnees/, /analyses/, /prediction/.
Ces pages contiennent uniquement un titre et une navigation ; les fonctionnalités restent à réaliser.

## Premier lancement chez un collègue (Windows)

Installer Python 3.12 et Git, cloner le dépôt commun puis ouvrir un terminal dans le dossier du projet.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -c "from pathlib import Path; import secrets; Path('.env').write_text('DJANGO_SECRET_KEY='+secrets.token_urlsafe(50)+'\nDJANGO_DEBUG=1\n',encoding='utf-8')"
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py createsuperuser
.\.venv\Scripts\python.exe manage.py runserver
```

La commande de création de .env est à exécuter une seule fois sur un nouveau poste.
Sous macOS/Linux : utiliser python3.12 et .venv/bin/python à la place des chemins Windows.
requirements.txt fixe les versions de Django et des bibliothèques de données/ML ; les dépendances sont installées par pip, pas par Git.

## Après un pull

```powershell
git pull --ff-only
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py check
```

## Travail en groupe

- Un dépôt commun, une branche par fonctionnalité : feat/ayoub-profil, feat/hajer-carte, feat/omar-prediction.
- Chacun garde sa base locale. Versionner les migrations, jamais db.sqlite3 ou .venv.
- Ne pas versionner .env, les mots de passe, les gros datasets ou les modèles entraînés.
- Discuter les changements des modèles partagés avant de les modifier.
- Ajouter les nouvelles dépendances à requirements.txt dans la même modification que le code qui les utilise.
- Le dépôt local est initialisé sur main et relié à https://github.com/MedAyoubGouader/Smart_Agriculture_AI.git.

Les paramètres actuels servent au développement local, pas au déploiement public.
