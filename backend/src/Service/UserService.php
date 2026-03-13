<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use InvalidArgumentException;

class UserService
{
    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function createUser(array $data): User
    {
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            throw new InvalidArgumentException('Missing username, email, or password.');
        }

        $user = new User();
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);
        
        // Hachage du mot de passe (Logique métier)
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Délégation de la sauvegarde au Repository
        $this->userRepository->save($user, true);

        return $user;
    }
}
