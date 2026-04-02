<?php

namespace App\Service;

use App\Dto\CreatePostPayload;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Service\HashtagService;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

class PostService
{
    public function __construct(
        private PostRepository $postRepository,
        private string $projectDir,
        private HashtagService $hashtagService
    ) {
    }

    public function createPost(CreatePostPayload $payload, User $author): Post
    {
        $post = new Post();
        $post->setTextContent($payload->getTextContent());
        $post->setCreatedAt(new \DateTimeImmutable());
        $post->setAuthor($author);
        $post->setIsCensored(false); // Par défaut, le post n'est pas censuré

        // Gérer l'upload de fichier si présent
        if ($payload->getMedia() !== null) {
            $mediaUrl = $this->handleMediaUpload($payload->getMedia());
            $post->setMediaUrl($mediaUrl);
        }

        // Extrait les mentions du texte et les sauvegarde
        $mentions = $this->hashtagService->extractMentions($payload->getTextContent());
        if (!empty($mentions)) {
            $post->setMentions($mentions);
        }

        // Parse et associe les hashtags au post
        $this->hashtagService->processPostContent($post);

        // Délégation de la sauvegarde au Repository
        $this->postRepository->save($post, true);

        return $post;
    }

    public function updatePost(Post $post, CreatePostPayload $payload, bool $removeMedia): Post
    {
        $post->setTextContent($payload->getTextContent());

        if ($removeMedia) {
            $post->setMediaUrl(null);
        }

        if ($payload->getMedia() !== null) {
            $mediaUrl = $this->handleMediaUpload($payload->getMedia());
            $post->setMediaUrl($mediaUrl);
        }

        // Extrait les mentions du texte et les met à jour
        $mentions = $this->hashtagService->extractMentions($payload->getTextContent());
        $post->setMentions(!empty($mentions) ? $mentions : null);

        // Parse et met à jour les hashtags
        $this->hashtagService->processPostContent($post);

        $this->postRepository->save($post, true);

        return $post;
    }

    private const ALLOWED_MIME_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    ];

    private function handleMediaUpload($uploadedFile): string
    {
        try {
            // Valider le MIME type réel (pas l'extension client)
            $mimeType = $uploadedFile->getMimeType();
            if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
                throw new InvalidArgumentException('Type de fichier non autorisé. Formats acceptés : JPEG, PNG, GIF, WebP, MP4, WebM.');
            }

            $fileName = bin2hex(random_bytes(16));
            $extension = $uploadedFile->guessExtension() ?? 'bin';
            $newFileName = $fileName . '.' . $extension;

            $uploadDir = $this->projectDir . '/public/uploads/media';

            if (!is_dir($uploadDir) && !@mkdir($uploadDir, 0755, true)) {
                throw new FileException('Impossible de créer le répertoire des médias.');
            }

            if (!is_writable($uploadDir)) {
                throw new FileException('Le répertoire des médias n\'a pas les permissions d\'écriture.');
            }

            $uploadedFile->move($uploadDir, $newFileName);

            return '/uploads/media/' . $newFileName;
        } catch (FileException $e) {
            throw new InvalidArgumentException('Erreur lors de l\'upload du fichier : ' . $e->getMessage());
        }
    }

    public function toggleLike(Post $post, User $user): array
    {
        // Vérifier si l'auteur du post a bloqué l'utilisateur
        $author = $post->getAuthor();
        if ($author && $author->getBlocked()->contains($user)) {
            throw new \InvalidArgumentException('Vous ne pouvez pas interagir avec ce contenu.');
        }

        if ($post->getLikedBy()->contains($user)) {
            $post->removeLikedBy($user);
            $isLiked = false;
        } else {
            $post->addLikedBy($user);
            $isLiked = true;
        }

        $this->postRepository->save($post, true);

        return [
            'liked' => $isLiked,
            'likesCount' => $post->getLikedBy()->count(),
        ];
    }

    /**
     * Hydrate les relations isLikedByCurrentUser et isFollowedByCurrentUser
     * sur un tableau de posts pour l'utilisateur courant.
     *
     * @param Post[] $posts
     */
    public function hydratePostRelations(array $posts, ?User $currentUser): void
    {
        if (empty($posts)) {
            return;
        }

        // Hydratation globale : nombre de retweets (pas besoin d'être connecté)
        $postIds = array_map(fn($p) => $p->getId(), $posts);
        $retweetsCounts = $this->postRepository->getRetweetsCounts($postIds);

        foreach ($posts as $post) {
            $post->setRetweetsCount($retweetsCounts[$post->getId()] ?? 0);
        }

        // Hydratation liée à l'utilisateur courant
        if ($currentUser === null) {
            return;
        }

        foreach ($posts as $post) {
            $post->setIsLikedByCurrentUser($post->getLikedBy()->contains($currentUser));
            $author = $post->getAuthor();
            if ($author) {
                $author->setIsFollowedByCurrentUser($currentUser->getSubscription()->contains($author));
            }
        }
    }

    /**
     * Hydrate les relations pour un seul post.
     */
    public function hydratePostRelation(Post $post, ?User $currentUser): void
    {
        $this->hydratePostRelations([$post], $currentUser);
    }
}
