<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

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
        }
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

