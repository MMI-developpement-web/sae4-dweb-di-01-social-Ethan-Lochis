---
description: Instructions et bonnes pratiques globales — Frontend React/TS + Backend Symfony/PHP
applyTo: "**"
---

# Contexte du projet

Réseau social fullstack. Stack :
- **Frontend** : React + TypeScript + Vite + Tailwind CSS v4
- **Backend** : Symfony 7.4 + PHP 8.2 (API REST JSON)
- **Base de données** : MySQL 8
- **Infrastructure** : Docker (nginx, php-fpm, mysql, phpmyadmin)

---

# Mise à jour de ces instructions

- **À chaque contribution significative** (nouveau composant, nouvelle convention, règle établie), mettre à jour ce fichier pour refléter la décision prise.
- Ce fichier est la source de vérité du projet : il doit rester synchronisé avec le code réel.
- Si une règle de ce fichier est contredite par le code après une modification, corriger l'une ou l'autre immédiatement.

---

# Documentation

- Toujours utiliser **Context7** (`use context7`) pour récupérer la documentation officielle et à jour des librairies avant de répondre à une question ou d'implémenter une fonctionnalité. **Aucune exception.**
- **Frontend** — Librairies principales : `react`, `class-variance-authority`, `tailwind-merge`, `clsx`, `react-router`.
- **Backend** — Librairies principales : `symfony/framework-bundle`, `doctrine/orm`, `lexik/jwt-authentication-bundle`, `symfony/serializer`, `symfony/security-bundle`.

---

# Architecture des composants

## Séparation des responsabilités

- **Composant UI (dumb)** : reçoit tout via props, aucun `useState`, aucun fetch. Exemples : `Comment`, `Publisher`.
- **Composant interactif** : gère son propre état interne avec `useState`. Exemples : `Like`, `Reactions`.
- Ne jamais dupliquer la logique d'état — si un composant A utilise un composant B, laisser B gérer son état.

## Structure des fichiers

```
src/components/ui/         ← atomes & molécules (génériques)
  ├── Icons.tsx            ← toutes les icônes SVG exportées
  ├── Button.tsx           ← atome
  ├── BadgeCn.tsx          ← atome
  ├── Label.tsx            ← atome
  ├── ErrorMessage.tsx     ← atome
  ├── Checkbox.tsx         ← atome
  ├── InputField.tsx       ← atome
  ├── Like.tsx             ← atome interactif
  ├── FormField.tsx        ← molécule (Label + InputField + ErrorMessage)
  ├── Publisher.tsx        ← molécule
  ├── Comment.tsx          ← molécule
  └── ...
src/components/            ← organismes / features (spécifiques)
  ├── Login.tsx
  └── ...
src/lib/
  └── utils.ts             ← fonction cn() (clsx + tailwind-merge)
```

## Architecture Atomes / Molécules / Organismes

Suivre une architecture inspirée de l'**Atomic Design** pour séparer le générique du spécifique :

### Atomes (`src/components/ui/`)
Briques de base sans logique métier. Aucun appel API, aucun contexte applicatif.
Exemples : `Button`, `InputField`, `Label`, `ErrorMessage`, `Checkbox`

### Molécules (`src/components/ui/`)
Combinaisonsd'atomes formant une unité fonctionnelle réutilisable.
Exemples : `FormField`, `Comment`, `Publisher`

Le composant `FormField` est le **pattern standard** pour les formulaires — il regroupe `Label` + `InputField` + `ErrorMessage` :

```tsx
<FormField
  id="email"
  label="Adresse e-mail"
  variant="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

### Organismes / Features (`src/components/`)
Composants spécifiques à une feature. Ils peuvent avoir leur propre état (`useState`) et logique.
Exemples : `Login`, `RegisterForm`, `PostEditor`

> **Règle** : Un organisme ne va **jamais** dans `src/components/ui/`.

---

# Conventions de code

## Variants avec CVA

Toujours utiliser `cva` (class-variance-authority) pour les variants de composants :

```tsx
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { primary: "...", secondary: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

interface Props extends VariantProps<typeof buttonVariants> {
  children: ReactNode;
}
```

## `className` interdit dans les composants UI

- **Ne jamais** ajouter `className?: string` dans l'interface ou les props d'un composant `src/components/ui/`.
- Le style est contrôlé **uniquement** via les variants CVA. Si un nouveau style est nécessaire, créer un variant.
- `cn()` peut être utilisé en interne pour combiner des variants ou des conditions, mais jamais pour exposer un `className` externe.

```tsx
// ✅ correct
<button className={buttonVariants({ variant, size })} />
<button className={cn(buttonVariants({ variant }), disabled && "opacity-50")} />

// ❌ interdit
<button className={cn(buttonVariants({ variant }), className)} />
```

## Fusion de classes

Utiliser `cn()` de `lib/utils.ts` pour fusionner des classes conditionnelles en interne :

```tsx
import { cn } from "../../lib/utils";
className={cn(buttonVariants({ variant, size }), disabled && "opacity-50")}
```

## Icônes SVG

Toutes les icônes sont dans `Icons.tsx` avec une prop `className` :

```tsx
interface IconProps { className?: string; }

export function IconHeart({ className = "size-6" }: IconProps) {
  return <svg className={className}>...</svg>;
}
```

Importer et utiliser la prop `className` pour contrôler taille et couleur :

```tsx
<IconHeart className={cn("size-5", active ? "stroke-red-500 fill-red-500" : "stroke-gray-600")} />
```

## Gestion de l'état

- Nommer les handlers `handleXxx` et les définir dans le corps du composant, pas inline.
- Utiliser la forme fonctionnelle pour les setters interdépendants : `setCount((c) => c + 1)`.
- Ne jamais imbriquer un setter dans un autre setter (cause des doubles exécutions en StrictMode).

```tsx
// ✅ correct
function handleClick() {
  const next = !active;
  setActive(next);
  setCount((c) => (next ? c + 1 : c - 1));
}

// ❌ incorrect
setActive((prev) => {
  setCount(...); // appelé 2x en StrictMode
  return !prev;
});
```

## Props par défaut

Toujours prévoir une prop `defaultXxx` pour initialiser l'état depuis des données externes (BDD) :

```tsx
defaultLiked?: boolean;  // pour initialiser depuis la BDD
defaultCount?: number;
```

---

# Tailwind CSS

- Utiliser les classes natives Tailwind plutôt que les valeurs arbitraires quand possible : `size-4.5` plutôt que `size-[18px]`.
- Cibler les éléments enfants SVG via `[&>svg]:classe` dans CVA.
- Pour changer la couleur d'un SVG : utiliser `stroke-xxx` et `fill-xxx` (pas `text-xxx`).

---

# Images & Avatars

- La BDD stocke uniquement le **chemin ou l'URL** de l'image, jamais le fichier binaire.
- Fallback avatar sans API externe :
```tsx
src={avatarUrl ?? `https://ui-avatars.com/api/?name=${username}&background=random`}
```
- En production : stocker les images sur un service cloud (Cloudinary, AWS S3) et sauvegarder l'URL en BDD.

---

# Backend — Symfony / PHP

## Structure des fichiers

```
backend/src/
  Controller/      ← contrôleurs API REST (suffixe Controller)
  Entity/          ← entités Doctrine (mapping BDD)
  Repository/      ← requêtes Doctrine personnalisées
  Service/         ← logique métier extraite des contrôleurs
  EventSubscriber/ ← abonnés aux événements Symfony
  DTO/             ← objets de transfert de données (entrée/sortie API)
```

## Contrôleurs

- Un contrôleur = une ressource REST (ex. `PostController`, `UserController`).
- Annoter les routes avec `#[Route]` en attribut PHP 8.
- Toujours typer les paramètres et le retour (ex. `JsonResponse`).
- Garder les contrôleurs fins : déléguer la logique aux Services.
- Retourner systématiquement du JSON via `$this->json(...)` ou `JsonResponse`.

```php
#[Route('/api/posts', name: 'post_list', methods: ['GET'])]
public function list(PostRepository $repo): JsonResponse
{
    return $this->json($repo->findAll(), 200, [], ['groups' => ['post:read']]);
}
```

## Repository Doctrine

- Les requêtes personnalisées (filtres, tris spécifiques avec `findBy` ou `QueryBuilder`) doivent être encapsulées dans des méthodes dédiées du Repository (ex: `findLatest()`).
- Ne jamais polluer les Contrôleurs ou les Services avec des règles de récupération de données. Le Contrôleur doit simplement appeler `$repository->find...()`.
- Un Repository ne gère que l'accès aux données (les `SELECT`), il n'a pas la responsabilité d'écrire en base (sauf les méthodes `save` et `remove` par défaut) ou de faire de la logique métier.

## Entités Doctrine

- Une entité = une table. Nom au singulier, PascalCase (ex. `Post`, `User`).
- Toujours déclarer les attributs de mapping avec les attributs PHP 8 (`#[ORM\Column]`, etc.).
- Utiliser `#[ORM\GeneratedValue]` + `#[ORM\Id]` pour la clé primaire auto-incrémentée.
- Ajouter des groupes de sérialisation (`#[Groups]`) pour contrôler ce qui est exposé en JSON.

```php
#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['post:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 280)]
    #[Groups(['post:read', 'post:write'])]
    private string $content;
}
```

## API REST — Conventions

| Méthode | Route              | Action            |
|---------|--------------------|-------------------|
| GET     | `/api/resource`    | Liste             |
| GET     | `/api/resource/{id}` | Détail          |
| POST    | `/api/resource`    | Création          |
| PATCH   | `/api/resource/{id}` | Mise à jour partielle |
| DELETE  | `/api/resource/{id}` | Suppression      |

- Réponses de succès : `200 OK`, `201 Created`, `204 No Content`.
- Réponses d'erreur : `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity`.
- Toujours inclure un message d'erreur lisible dans le JSON d'erreur : `{ "error": "..." }`.

## Authentification JWT

- Utiliser `lexik/jwt-authentication-bundle` pour générer et valider les tokens.
- Le token est envoyé dans l'en-tête `Authorization: Bearer <token>`.
- Les routes publiques (login, register) sont exclues du firewall JWT.
- Ne jamais stocker le token en session côté serveur — l'API est **stateless**.

## Sécurité

- Valider et assainir **toutes** les entrées utilisateur (formulaires, query params, JSON body).
- Utiliser le composant `symfony/validator` avec les contraintes (`#[Assert\NotBlank]`, etc.).
- Ne jamais construire de requêtes SQL manuellement — toujours passer par Doctrine.
- Hasher les mots de passe avec `symfony/password-hasher` (jamais MD5/SHA1).
- Contrôler les accès avec `#[IsGranted]` ou `$this->denyAccessUnlessGranted(...)`.

## Services

- Extraire toute logique métier non triviale dans un service (`src/Service/`).
- Les services sont injectés via l'autowiring Symfony (constructeur).
- Nommer les méthodes de manière explicite : `createPost()`, `followUser()`.

---

# Pages et Routes Frontend

## Pages créées (`src/Routes/`)

| Page      | Route    | Description                                          |
|-----------|----------|------------------------------------------------------|
| `Auth`    | `/Auth`  | Authentification (Login + Register)                  |
| `Home`    | `/`      | Timeline globale avec tous les posts                 |
| `Profile` | `/profile` | Page profil utilisateur (protégée) avec ses posts   |
| `PostingPage` | `/posting` | Formulaire de création de post               |
| `NotFound` | `*`     | Page 404 catch-all                                   |

## Composants de Page / Organismes

- **`Profile.tsx`** : Page profil utilisateur. Récupère les posts via `/posts/user/{id}`, affiche `ProfileHeader` + liste des posts. **Protégée** - redirige vers `/Auth` si non-authentifié.
- **`Home.tsx`** : Timeline globale. Fetch tous les posts via `/posts`, affiche composant `Posting` (formulaire) + liste de posts.
- **`Posting.tsx`** (organisme spécifique) : Formulaire interactif de création de post.

## Composants UI - Molécules nouvelles

- **`ProfileHeader.tsx`** : Molécule affichant l'avatar, username (via `Publisher`), et 3 statistiques (Posts, Abonnements, Abonnés). Inclut un menu déroulant accessible via `IconSettings` avec bouton de déconnexion (`IconLogout`).
- **`Publisher.tsx`** : Molécule réutilisable (avatar + username). Supports variants `size` (sm/md/lg) et `ring` (none/default/primary/secondary).

---

# Authentification et Contexte

## AuthContext (`src/contexts/AuthContext.tsx`)

- **Lazy initialization** : L'état (`token` et `user`) est initialisé depuis le `localStorage` **au moment de la création** du composant, via des fonctions d'initialisation passées à `useState()`. Cela évite les race conditions lors de la restauration de session.
- Structure : 
  ```tsx
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  ```
- Cela garantit que `user` n'est **jamais** `null` pendant une fraction de seconde (évite les faux redirects vers `/Auth`).

## Protocole de protection des routes

- Les pages protégées (ex. `/profile`) redirigent vers `/Auth` si `!user` au premier rendu du composant via un `useEffect`.
- La redirection utilise `useNavigate()` de React Router avec `{ replace: true }`.

---

# API REST Backend

## Routes Utilisateurs & Posts

### Posts Controller (`backend/src/Controller/PostController.php`)

| Méthode | Route              | Description                         |
|---------|-------------------|-------------------------------------|
| GET     | `/api/posts`      | Liste tous les posts (derniers en premier) |
| GET     | `/api/posts/{id}` | Détail d'un post                    |
| GET     | `/api/posts/user/{userId}` | Posts d'un utilisateur spécifique (ordonnés DESC par ID) |
| POST    | `/api/posts`      | Créer un post (auth requise)       |

### PostRepository (`backend/src/Repository/PostRepository.php`)

- **`findLatest()`** : Retourne tous les posts triés DESC par ID.
- **`findByAuthor(int $authorId)`** : Retourne tous les posts d'un auteur spécifique, triés DESC.

### Entité Post

- **Propriété** `Author` : Relation `ManyToOne` vers `User`.
- **Sérialisation** : Groupe `post:read` expose `id`, `TextContent`, `CreatedAt`, `Author` (id, username).

---

# Authentification JWT et Token Management

## TokenManager (`backend/src/Service/TokenManager.php`)

- **`generateAndSaveToken(User $user)`** : Génère un token aléatoire (32 bytes hex), supprime l'ancien token de l'utilisateur (si présent), crée une entité `ApiToken`, et la persiste en BDD.
- **Cascade** : La relation `User` → `ApiToken` utilise `cascade: ['persist']` uniquement (**pas** `cascade: ['remove']` pour éviter les violations de contrainte FK).

## ApiToken Entity

- **Relation** : `OneToOne(inversedBy: 'apiToken')` avec `User` côté inverse.
- **Important** : **Ne pas** mettre `cascade: ['remove']` sur la relation `User` côté `ApiToken` — cela causait des erreurs 500 lors du login (tentative de supprimer l'utilisateur quand on supprime son token).

---

# Infrastructure Docker

## Services et ports

| Service         | Port local | Description                   |
|-----------------|------------|-------------------------------|
| `sae-nginx`     | 8080       | Proxy backend                 |
| `sae-nginx`     | 8090       | Proxy frontend                |
| `sae-frontend`  | 5173       | Dev server Vite               |
| `sae-backend`   | 9000       | PHP-FPM                       |
| `sae-mysql`     | (interne)  | MySQL 8                       |
| `sae-phpmyadmin`| 8070       | Interface phpMyAdmin           |

## Conventions

- Les variables d'environnement backend sont définies dans `backend/.env`.
- Les variables d'environnement frontend sont définies dans `frontend/.env` (préfixe `VITE_`).
- Ne jamais commiter de `.env` contenant des secrets — utiliser `.env.local` ou des secrets Docker.
- Les scripts SQL d'initialisation DB sont dans `docker/mysql/sql_import_scripts/`.
