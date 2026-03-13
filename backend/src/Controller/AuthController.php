<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'app_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        // Symfony intercepte cette route grâce au json_login dans security.yaml.
        // Si l'authentification réussit, on arrive ici. On peut donc renvoyer les infos de l'utilisateur.
        
        if (null === $user) {
            return $this->json([
                'error' => 'Identifiants invalides.'
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'profilePicture' => $user->getProfilePicture(),
            ]
        ]);
    }

    #[Route('/api/logout', name: 'app_logout', methods: ['POST'])]
    public function logout(): void
    {
        // Symfony intercepte cette route pour gérer la déconnexion automatiquement.
        throw new \LogicException('Cette méthode ne devrait jamais être atteinte.');
    }
}
