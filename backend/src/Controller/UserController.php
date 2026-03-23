<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/users', name: 'user_')]
class UserController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(UserRepository $userRepository): JsonResponse
    {
        $users = array_map(
            $this->serializeUser(...),
            $userRepository->findAll()
        );

        return $this->json($users);
    }


    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, UserService $userService): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        try {
            $user = $userService->createUser($data);
            return $this->json($this->serializeUser($user), JsonResponse::HTTP_CREATED);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            // Capturer toute autre erreur (contraintes DB, etc.)
            return $this->json(['error' => 'Une erreur est survenue lors de la création du compte.'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/follow', name: 'follow', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function follow(int $id, UserRepository $userRepository, UserService $userService, #[CurrentUser] ?User $currentUser): JsonResponse
    {
        if ($currentUser === null) {
            return $this->json(['error' => 'Authentication required.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $targetUser = $userRepository->find($id);

        if ($targetUser === null) {
            return $this->json(['error' => 'User not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        try {
            $userService->followUser($currentUser, $targetUser);
            return $this->json(['message' => 'Successfully followed user.'], JsonResponse::HTTP_OK);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}/follow', name: 'unfollow', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function unfollow(int $id, UserRepository $userRepository, UserService $userService, #[CurrentUser] ?User $currentUser): JsonResponse
    {
        if ($currentUser === null) {
            return $this->json(['error' => 'Authentication required.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $targetUser = $userRepository->find($id);

        if ($targetUser === null) {
            return $this->json(['error' => 'User not found.'], JsonResponse::HTTP_NOT_FOUND);
        }

        try {
            $userService->unfollowUser($currentUser, $targetUser);
            return $this->json(['message' => 'Successfully unfollowed user.'], JsonResponse::HTTP_OK);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], JsonResponse::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function getCurrentUser(#[CurrentUser] ?User $currentUser, UserRepository $userRepository): JsonResponse
    {
        if ($currentUser === null) {
            return $this->json(['error' => 'Authentication required.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $followedIds = array_map(
            fn($u) => $u->getId(),
            $currentUser->getSubscription()->toArray()
        );

        // Compter les followers (utilisateurs qui suivent l'utilisateur courant)
        $followers = $userRepository->findBy([], null);
        $followerCount = 0;
        foreach ($followers as $follower) {
            if ($follower->getSubscription()->contains($currentUser)) {
                $followerCount++;
            }
        }

        return $this->json([
            'user' => $this->serializeUser($currentUser),
            'followedIds' => $followedIds,
            'followingCount' => $currentUser->getSubscription()->count(),
            'followerCount' => $followerCount,
        ]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'profilePicture' => $user->getProfilePicture(),
            'roles' => $user->getRoles(),
        ];
    }
}

