<?php

namespace App\Controller;

use App\Dto\CreatePostPayload;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/posts', name: 'post_')]
class PostController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request, PostRepository $postRepository, #[CurrentUser] ?User $user): JsonResponse
    {
        $limit = $request->query->getInt('limit', 7);
        $offset = $request->query->getInt('offset', 0);
        $feed = $request->query->get('feed', 'foryou');

        if ($feed === 'following' && $user) {
            $posts = $postRepository->findFollowing($user, $limit, $offset);
        } else {
            $posts = $postRepository->findLatest($limit, $offset);
        }

        if ($user) {
            foreach ($posts as $post) {
                $post->setIsLikedByCurrentUser($post->getLikedBy()->contains($user));
                $author = $post->getAuthor();
                if ($author) {
                    $author->setIsFollowedByCurrentUser($user->getSubscription()->contains($author));
                }
            }
        }

        return $this->json(
            $posts,
            200,
            [],
            ['groups' => ['post:read']]
        );
    }
    #[Route('/user/{userId}', name: 'by_user', requirements: ['userId' => '\d+'], methods: ['GET'])]
    public function listByUser(int $userId, UserRepository $userRepository, PostRepository $postRepository, #[CurrentUser] ?User $currentUser): JsonResponse
    {
        $user = $userRepository->find($userId);

        if ($user === null) {
            return $this->json(['error' => 'User not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $posts = $postRepository->findByAuthor($userId);

        if ($currentUser) {
            foreach ($posts as $post) {
                $post->setIsLikedByCurrentUser($post->getLikedBy()->contains($currentUser));
                $author = $post->getAuthor();
                if ($author) {
                    $author->setIsFollowedByCurrentUser($currentUser->getSubscription()->contains($author));
                }
            }
        }

        return $this->json(
            $posts,
            200,
            [],
            ['groups' => ['post:read']]
        );
    }
    #[Route('/{id}', name: 'show', requirements: ['id' => '\\d+'], methods: ['GET'])]
    public function show(int $id, PostRepository $postRepository, #[CurrentUser] ?User $user): JsonResponse
    {
        $post = $postRepository->find($id);

        if ($post === null) {
            return $this->json(['error' => 'Post not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($user) {
            $post->setIsLikedByCurrentUser($post->getLikedBy()->contains($user));
            $author = $post->getAuthor();
            if ($author) {
                $author->setIsFollowedByCurrentUser($user->getSubscription()->contains($author));
            }
        }

        return $this->json($post, 200, [], ['groups' => ['post:read']]);
    }
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, PostService $postService, #[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['error' => 'Vous devez être connecté pour créer un post.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        try {
            // Créer le DTO à partir de la requête multipart/form-data
            $payload = new CreatePostPayload();
            $payload->setTextContent($request->request->get('textContent', ''));
            $payload->setMedia($request->files->get('media'));

            // Validation du textContent
            if (empty($payload->getTextContent())) {
                return $this->json(['error' => 'Le contenu du post ne peut pas être vide.'], JsonResponse::HTTP_BAD_REQUEST);
            }

            if (strlen($payload->getTextContent()) > 510) {
                return $this->json(['error' => 'Le contenu ne doit pas dépasser 510 caractères.'], JsonResponse::HTTP_BAD_REQUEST);
            }

            $post = $postService->createPost($payload, $user);
            return $this->json($post, JsonResponse::HTTP_CREATED, [], ['groups' => ['post:read']]);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            // Log l'erreur complète
            error_log('PostController create error: ' . $e->getMessage() . ' - ' . $e->getFile() . ':' . $e->getLine());
            return $this->json(['error' => 'Erreur serveur lors de la création du post.'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function update(int $id, Request $request, PostRepository $postRepository, PostService $postService, #[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['error' => 'Vous devez être connecté pour modifier un post.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = $postRepository->find($id);

        if ($post === null) {
            return $this->json(['error' => 'Post not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($post->getAuthor() !== $user) {
            return $this->json(['error' => 'Vous n\'êtes pas autorisé à modifier ce post.'], JsonResponse::HTTP_FORBIDDEN);
        }

        try {
            // Créer le DTO à partir de la requête multipart/form-data
            $payload = new CreatePostPayload();
            $payload->setTextContent($request->request->get('textContent', ''));
            $payload->setMedia($request->files->get('media'));

            // Validation du textContent
            if (empty($payload->getTextContent())) {
                return $this->json(['error' => 'Le contenu du post ne peut pas être vide.'], JsonResponse::HTTP_BAD_REQUEST);
            }

            if (strlen($payload->getTextContent()) > 510) {
                return $this->json(['error' => 'Le contenu ne doit pas dépasser 510 caractères.'], JsonResponse::HTTP_BAD_REQUEST);
            }

            $removeMedia = $request->request->getBoolean('removeMedia', false);

            $post = $postService->updatePost($post, $payload, $removeMedia);

            $post->setIsLikedByCurrentUser($post->getLikedBy()->contains($user));
            $author = $post->getAuthor();
            if ($author) {
                $author->setIsFollowedByCurrentUser($user->getSubscription()->contains($author));
            }

            return $this->json($post, JsonResponse::HTTP_OK, [], ['groups' => ['post:read']]);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            error_log('PostController update error: ' . $e->getMessage() . ' - ' . $e->getFile() . ':' . $e->getLine());
            return $this->json(['error' => 'Erreur serveur lors de la modification du post.'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/like', name: 'like', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function toggleLike(int $id, PostRepository $postRepository, PostService $postService, #[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['error' => 'Vous devez être connecté pour liker un post.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = $postRepository->find($id);

        if ($post === null) {
            return $this->json(['error' => 'Post not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $result = $postService->toggleLike($post, $user);

        return $this->json($result, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(int $id, PostRepository $postRepository, #[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['error' => 'Vous devez être connecté pour supprimer un post.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $post = $postRepository->find($id);

        if ($post === null) {
            return $this->json(['error' => 'Post not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($post->getAuthor() !== $user) {
            return $this->json(['error' => 'Vous n\'êtes pas autorisé à supprimer ce post.'], JsonResponse::HTTP_FORBIDDEN);
        }

        $postRepository->remove($post, true);

        return $this->json(null, JsonResponse::HTTP_NO_CONTENT);
    }
}
