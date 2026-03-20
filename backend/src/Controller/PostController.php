<?php

namespace App\Controller;

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

        $posts = $postRepository->findLatest($limit, $offset);

        if ($user) {
            foreach ($posts as $post) {
                $post->setIsLikedByCurrentUser($post->getLikedBy()->contains($user));
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
        }

        return $this->json($post, 200, [], ['groups' => ['post:read']]);
    }
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, PostService $postService, #[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['error' => 'Vous devez être connecté pour créer un post.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $post = $postService->createPost($data, $user);
            return $this->json($post, JsonResponse::HTTP_CREATED, [], ['groups' => ['post:read']]);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
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
