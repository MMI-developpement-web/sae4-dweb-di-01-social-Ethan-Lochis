# SAE 401 — Réseau Social Fullstack

Un réseau social moderne combinant une API REST robuste (Symfony) et une interface utilisateur réactive (React). Plateforme permettant aux utilisateurs de publier du contenu, de suivre d'autres utilisateurs, d'interagir via des likes et de modérer les comptes.

## Stack Technique

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS v4
- **Backend** : Symfony 7.4 + PHP 8.2 + API REST (JSON)
- **Base de données** : MySQL 8
- **Infrastructure** : Docker Compose (Nginx, PHP-FPM, MySQL, phpMyAdmin)

## Fonctionnalités Principales

✅ **Authentification JWT** — Inscription, connexion, tokens sécurisés
✅ **Gestion des posts** — Créer, consulter, supprimer vos contenus
✅ **Système de likes** — Interagir avec les posts
✅ **Système de suivi** — Follow/Unfollow d'autres utilisateurs
✅ **Dual Feed** — Timeline personnalisée (Pour vous / Abonnements)
✅ **Profils utilisateurs** — Consulter les posts de chaque utilisateur
✅ **Modération d'administrateur** — Bloquer des comptes via le dashboard EasyAdmin
✅ **Déconnexion automatique** — Les comptes bloqués sont immédiatement révoqués

## Installation Locale

### Prérequis
- Docker & Docker Compose
- Git

### 1. Cloner et configurer

```bash
git clone <repository>
cd SAE401
```

### 2. Installer les dépendances

```bash
# Frontend (Node.js + npm)
docker compose run --rm sae-frontend npm install

# Backend (PHP + Composer)
docker compose run --rm sae-backend composer install
```

### 3. Configurer les variables d'environnement

- **Frontend** : Créer `frontend/.env` avec vos variables (ex: `VITE_API_URL`)
- **Backend** : Créer `backend/.env` avec les credentials MySQL

### 4. Démarrer les conteneurs

```bash
docker compose up -d
```

Vérifiez que tous les conteneurs sont actifs :
```bash
docker compose ps
```

### 5. Initialiser la base de données

```bash
# Exécuter les migrations Doctrine
docker compose exec sae-backend php bin/console doctrine:migrations:migrate
```

## Accéder à l'Application

### Développement Local

| Service | URL |
|---------|-----|
| **Frontend** | [http://localhost:8090](http://localhost:8090) |
| **Backend API** | [http://localhost:8080](http://localhost:8080) |
| **Dashboard Admin (EasyAdmin)** | [http://localhost:8080/admin](http://localhost:8080/admin) |
| **phpMyAdmin** | [http://localhost:8070](http://localhost:8070) |

### Production (Serveur UNILIM)

| Service | URL |
|---------|-----|
| **Frontend** | [https://mmi.unilim.fr/~lochis1/SAE401/frontend/dist/](https://mmi.unilim.fr/~lochis1/SAE401/frontend/dist/) |
| **Dashboard Admin** | [https://mmi.unilim.fr/~lochis1/SAE401/backend/public/admin](https://mmi.unilim.fr/~lochis1/SAE401/backend/public/admin) |

## Architecture

### Frontend - Organisation Atomique

```
src/
├── Routes/           # Pages (Auth, Home, Profile, PostingPage)
├── components/
│   ├── ui/          # Atomes & Molécules (Button, FormField, Publisher)
│   └── ...          # Organismes métier
├── contexts/        # Contexte d'authentification
├── lib/
│   ├── api.ts       # Client HTTP centralisé (apiFetch)
│   └── utils.ts     # Utilitaires (cn - classe merger)
└── assets/
```

### Backend - Structure MVC

```
src/
├── Controller/      # Points d'entrée API REST
├── Entity/          # Modèles Doctrine (User, Post, ApiToken)
├── Repository/      # Requêtes personnalisées Doctrine
├── Service/         # Logique métier (TokenManager, PostService)
├── Security/        # Authentification (UserChecker, AccessTokenHandler)
└── EventSubscriber/ # CORS, événements système
```

## Pages Disponibles

| Route | Description |
|-------|-------------|
| `/` | Timeline globale avec tous les posts |
| `/Auth` | Inscription & Connexion |
| `/posting` | Formulaire de création de post |
| `/profile` | Votre profil avec vos posts |
| `*` | Page 404 |

## API REST - Endpoints Principaux

### Posts
```
GET    /api/posts                    # Liste tous les posts
GET    /api/posts/{id}               # Détail d'un post
GET    /api/posts/user/{userId}      # Posts d'un utilisateur
POST   /api/posts                    # Créer un post (auth)
POST   /api/posts/{id}/like          # Liker/Unliker (auth)
DELETE /api/posts/{id}               # Supprimer un post (auth + owner)
```

### Utilisateurs
```
POST   /api/users                    # Inscription
POST   /api/login                    # Connexion (JWT)
GET    /api/users                    # Lister les utilisateurs
POST   /api/users/{id}/follow        # Suivre un utilisateur (auth)
DELETE /api/users/{id}/follow        # Se désabonner (auth)
```

## Authentification

1. L'utilisateur se connecte via `/Auth` avec username/password
2. Le backend génère un token JWT valide stocké en base de données
3. Le token est sauvegardé localement (`localStorage`)
4. Chaque requête API inclut : `Authorization: Bearer <token>`
5. Si le compte est bloqué, le token est immédiatement rejeté (401)

## Modération et Blocage

Les administrateurs peuvent :
1. Accéder au dashboard admin : `/admin`
2. Sélectionner un utilisateur
3. Activer le toggle **"Compte bloqué"**
4. Les effets sont immédiats :
   - L'utilisateur bloqué est déconnecté
   - Ses posts affichent : *"Ce compte a été bloqué pour non respect des conditions d'utilisation"*
   - Ses likes disparaissent
   - Il ne peut plus se reconnecter

## Commandes Utiles

### Docker
```bash
# Démarrer les conteneurs
docker compose up -d

# Arrêter les conteneurs
docker compose down

# Voir les logs d'un service
docker compose logs -f sae-backend

# Exécuter une commande dans un conteneur
docker compose exec sae-backend php bin/console <command>
```

### Symfony (Backend)
```bash
# Migrations Doctrine
docker compose exec sae-backend php bin/console doctrine:migrations:migrate
docker compose exec sae-backend php bin/console make:migration

# Gérer le cache
docker compose exec sae-backend php bin/console cache:clear

# Créer un utilisateur admin
docker compose exec sae-backend php bin/console app:create-admin <username> <password>
```

### Vite (Frontend)
```bash
# Build pour la production
docker compose exec sae-frontend npm run build

# Lancer en mode développement (watch)
docker compose exec sae-frontend npm run dev
```

## Base de Données

Sauvegardez régulièrement votre BDD :
```bash
# Export SQL
docker compose exec sae-mysql mysqldump -u root -p<password> <db_name> > backup.sql

# Import SQL
docker compose exec -T sae-mysql mysql -u root -p<password> <db_name> < backup.sql
```

Alternativement, placez les fichiers SQL dans `docker/mysql/sql_import_scripts/` (auto-import au démarrage).

## Conventions de Code

### Frontend (React/TypeScript)
- Utiliser `CVA` (class-variance-authority) pour les variantes de composants
- Ne jamais ajouter `className` en prop sur les composants UI
- Nommer les handlers `handleXxx`
- Séparation : composants UI (sans état), composants métier (avec état)

### Backend (Symfony/PHP)
- Un contrôleur = une ressource REST
- Déléguer la logique métier aux Services
- Requêtes personnalisées dans les Repositories
- Valider via `#[Assert\...]` sur les Entités

## Contribution

1. Les changements importants doivent mettre à jour `.github/instructions/copilot-instructions.md`
2. Suivre l'architecture atomique (Frontend) et MVC (Backend)
3. Tester localement avant de pusher
4. Committer en français avec messages clairs

## Support & Déploiement

Pour le déploiement en production, consultez votre administrateur système UNILIM.
Assurez-vous que les variables d'environnement sensibles (JWT_SECRET, DB_PASSWORD, etc.) sont bien configurées sur le serveur.

---

**Dernière mise à jour** : Mars 2026  
**Responsables** : SAE 401 — Groupe développement


