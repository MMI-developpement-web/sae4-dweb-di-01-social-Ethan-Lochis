<?php

namespace App\Service;

use App\Entity\ApiToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class TokenManager
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    public function generateAndSaveToken(User $user): string
    {
        $tokenString = bin2hex(random_bytes(32));

        // Delete any existing token for this user
        $existingToken = $user->getApiToken();
        if ($existingToken) {
            $this->entityManager->remove($existingToken);
            $this->entityManager->flush();
        }

        $apiToken = new ApiToken();
        $apiToken->setToken($tokenString);
        $apiToken->setUser($user);

        // Keep relation synchronized on both sides
        $user->setApiToken($apiToken);

        $this->entityManager->persist($apiToken);
        $this->entityManager->flush();

        return $tokenString;
    }
}
