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
    public function list(Request $request, PostRepository $postRepository): JsonResponse
    {
        $limit = $request->query->getInt('limit', 7);
        $offset = $request->query->getInt('offset', 0);

        return $this->json(
            $postRepository->findLatest($limit, $offset),
            200,
            [],
            ['groups' => ['post:read']]
        );
    }
    #[Route('/user/{userId}', name: 'by_user', requirements: ['userId' => '\d+'], methods: ['GET'])]
    public function listByUser(int $userId, UserRepository $userRepository, PostRepository $postRepository): JsonResponse
    {
        $user = $userRepository->find($userId);

        if ($user === null) {
            return $this->json(['error' => 'User not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json(
            $postRepository->findByAuthor($userId),
            200,
            [],
            ['groups' => ['post:read']]
        );
    }
    #[Route('/{id}', name: 'show', requirements: ['id' => '\\d+'], methods: ['GET'])]
    public function show(int $id, PostRepository $postRepository): JsonResponse
    {
        $post = $postRepository->find($id);

        if ($post === null) {
            return $this->json(['error' => 'Post not found.'], JsonResponse::HTTP_NOT_FOUND);
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
}
