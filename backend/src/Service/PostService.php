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

    private function handleMediaUpload($uploadedFile): string
    {
        try {
            $fileName = $this->generateUniqueFileName();
            $extension = $this->getFileExtension($uploadedFile->getClientOriginalName());
            $newFileName = $fileName . '.' . $extension;

            // Créer le répertoire s'il n'existe pas
            $uploadDir = $this->projectDir . '/public/uploads/media';
            
            // Vérifier si le répertoire parent existe
            $uploadsParentDir = $this->projectDir . '/public/uploads';
            if (!is_dir($uploadsParentDir)) {
                if (!@mkdir($uploadsParentDir, 0755, true)) {
                    throw new FileException('Impossible de créer le répertoire des uploads.');
                }
            }

            // Créer le répertoire media
            if (!is_dir($uploadDir)) {
                if (!@mkdir($uploadDir, 0755, true)) {
                    throw new FileException('Impossible de créer le répertoire des médias.');
                }
            }

            // Vérifier les permissions
            if (!is_writable($uploadDir)) {
                throw new FileException('Le répertoire des médias n\'a pas les permissions d\'écriture.');
            }

            // Déplacer le fichier
            $uploadedFile->move($uploadDir, $newFileName);

            // Vérifier que le fichier existe bien
            $filePath = $uploadDir . '/' . $newFileName;
            if (!file_exists($filePath)) {
                throw new FileException('Le fichier n\'a pas pu être sauvegardé.');
            }

            // Retourner l'URL accessible
            return '/uploads/media/' . $newFileName;
        } catch (FileException $e) {
            throw new InvalidArgumentException('Erreur lors de l\'upload du fichier : ' . $e->getMessage());
        } catch (\Exception $e) {
            throw new InvalidArgumentException('Erreur inattendue lors de l\'upload : ' . $e->getMessage());
        }
    }

    private function generateUniqueFileName(): string
    {
        return bin2hex(random_bytes(16));
    }

    private function getFileExtension(string $originalFileName): string
    {
        $parts = explode('.', $originalFileName);
        return strtolower(end($parts));
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
