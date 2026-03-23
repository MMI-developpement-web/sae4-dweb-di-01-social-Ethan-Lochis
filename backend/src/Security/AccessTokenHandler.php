<?php

namespace App\Security;

use App\Repository\ApiTokenRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(
        private ApiTokenRepository $repository
    ) {
    }

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        // On cherche le token dans la base de données
        $apiToken = $this->repository->findOneBy(['Token' => $accessToken]);

        if (null === $apiToken || null === $apiToken->getUser()) {
            throw new BadCredentialsException('Invalid or expired token.');
        }

        if ($apiToken->getUser()->isBlocked()) {
            throw new BadCredentialsException('Account is blocked.');
        }

        // On retourne l'identifiant de l'utilisateur (email ou username, défini par getUserIdentifier())
        // Symfony cherchera ensuite l'utisateur via app_user_provider
        return new UserBadge($apiToken->getUser()->getUserIdentifier());
    }
}
