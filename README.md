# Smart Agriculture Tunisia

Plateforme web de prédiction du rendement agricole en Tunisie, avec carte interactive.
Projet — Mohamed Ayoub Gouader, Omar Cherif et Hajer Aroui.
Plan de réalisation : [docs/](docs/).

Architecture : **API REST** (Django + Django REST Framework) consommée par un **frontend React** (Vite + Leaflet),
base **PostgreSQL 18**.

## Dossiers

```
├── backend/          Django + DRF (API sur http://localhost:8000/api/<app>/)
├── frontend/         React (Vite, JSX) + Leaflet (http://localhost:5173)
├── data/geo/         GeoJSON des gouvernorats / délégations + table de référence
├── data/processed/   fichiers préparés pour l'import (prédictions, données nettoyées)
├── docs/             plan de réalisation
├── .env.example      modèle de configuration (copier en .env)
└── .htaccess         bloque l'accès via Apache (projet placé dans htdocs)
```

Projet Django (`backend/`) :

| Dossier | Utilité |
|---|---|
| smartagriculture | Le projet : configuration générale (`settings.py`) et URLs principales |
| core | Éléments communs (santé de l'API, permissions partagées…) |
| comptes | C1 — Comptes, rôles (agriculteur / administrateur) et authentification JWT (repris d'Ayoub) |

Chaque app est créée avec `python manage.py startapp` **à l'étape où sa fonctionnalité est développée** :

| App prévue | Étape | Utilité |
|---|---|---|
| referentiels, donnees | C2 | Gouvernorats, cultures, saisons ; import de l'historique et du climat — Hajer |
| cartographie | C3 | Carte et fiches régionales — Hajer |
| prediction | C5 | Prédictions (import du tableau exporté depuis Colab) — Omar |
| analyses | C7 | Historique et comparaison — Ayoub |

Dans chaque application : `models.py` décrit les données, `serializers.py` valide les entrées (équivalent des
formulaires), `views.py` contient les vues API en classes, `urls.py` les routes (préfixe `/api/<app>/`),
`admin.py` l'administration et `migrations/` l'historique de la base.

Les données brutes ne sont pas dans le dépôt : chacun indique leur dossier dans `RAW_DATA_DIR` (`.env`).

## Premier lancement (Windows)

Prérequis : Python 3.12+ (testé avec 3.14), Node 20+, PostgreSQL 18, Git.

### 1. Base de données (une fois, dans psql en tant que `postgres`)

```sql
CREATE ROLE smartagri WITH LOGIN PASSWORD 'choisir-un-mot-de-passe';
CREATE DATABASE smartagri OWNER smartagri ENCODING 'UTF8' TEMPLATE template0;
```

### 2. Configuration

Copier `.env.example` en `.env` à la racine, puis remplir `DJANGO_SECRET_KEY`, `DB_PASSWORD`, `RAW_DATA_DIR` et
`ADMIN_PASSWORD` (mot de passe du compte administrateur créé par `creer_admin`).
Générer une clé secrète :

```powershell
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 3. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py creer_admin        # compte admin (identifiants ADMIN_* du .env)
.\venv\Scripts\python.exe manage.py runserver      # http://localhost:8000/api/core/health/
```

Administration : http://127.0.0.1:8000/admin/ (un superutilisateur a automatiquement le rôle administrateur).
Tests : `.\venv\Scripts\python.exe manage.py test` (l'utilisateur PostgreSQL doit avoir le droit `CREATEDB`).

API des comptes (`/api/comptes/`) : `inscription/`, `verifier-mot-de-passe/`, `connexion/` (nom d'utilisateur
ou e-mail → jetons JWT), `jeton/rafraichir/`, `deconnexion/`, `profil/`, `profil/mot-de-passe/`,
`utilisateurs/` (administrateurs).

### 4. Frontend

```powershell
cd frontend
npm install
npm run dev                                         # http://localhost:5173
```

En développement, Vite redirige `/api` vers Django. La carte affiche en bas l'état de la connexion API + base.

## Après un pull

```powershell
git pull --ff-only
cd backend
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py check
cd ..\frontend
npm install
```

## Travail en groupe

- Un dépôt commun, une branche par fonctionnalité : feat/ayoub-profil, feat/hajer-carte, feat/omar-prediction.
  Fusion dans `main` par pull request relue.
- Chacun garde sa base locale. Versionner les migrations, jamais la base, `venv/` ou `node_modules/`.
- Ne pas versionner `.env`, les mots de passe, les gros datasets ou les modèles entraînés.
- Discuter les changements des modèles partagés avant de les modifier.
- Ajouter les nouvelles dépendances (`requirements.txt` ou `package.json`) dans la même modification que le code qui
  les utilise.

Les paramètres actuels servent au développement local, pas au déploiement public.
