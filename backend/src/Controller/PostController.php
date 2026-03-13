<?php

namespace App\Controller;

use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
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
    public function list(PostRepository $postRepository): JsonResponse
    {
        $posts = array_map(
            $this->serializePost(...),
            $postRepository->findLatest()
        );

        return $this->json($posts);
    }

    #[Route('/{id}', name: 'show', requirements: ['id' => '\\d+'], methods: ['GET'])]
    public function show(int $id, PostRepository $postRepository): JsonResponse
    {
        $post = $postRepository->find($id);

        if ($post === null) {
            return $this->json(['error' => 'Post not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json($this->serializePost($post));
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
            return $this->json($this->serializePost($post), JsonResponse::HTTP_CREATED);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
        }
    }
    private function serializePost(Post $post): array
    {
        return [
            'id' => $post->getId(),
            'textContent' => $post->getTextContent(),
            'createdAt' => $post->getCreatedAt()?->format(DATE_ATOM),
            'author' => $post->getAuthor() === null ? null : [
                'id' => $post->getAuthor()->getId(),
                'username' => $post->getAuthor()->getUsername(),
                'email' => $post->getAuthor()->getEmail(),
                'profilePicture' => $post->getAuthor()->getProfilePicture(),
            ],
        ];
    }
}
