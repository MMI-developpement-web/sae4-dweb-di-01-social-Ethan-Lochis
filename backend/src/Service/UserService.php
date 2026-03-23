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

        // Vérification d'unicité du username
        $existingUser = $this->userRepository->findOneBy(['username' => $data['username']]);
        if ($existingUser !== null) {
            throw new InvalidArgumentException('Ce nom d\'utilisateur est déjà utilisé.');
        }

        // Vérification d'unicité de l'email
        $existingEmail = $this->userRepository->findOneBy(['email' => $data['email']]);
        if ($existingEmail !== null) {
            throw new InvalidArgumentException('Cette adresse e-mail est déjà utilisée.');
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

    public function followUser(User $follower, User $target): bool
    {
        if ($follower->getId() === $target->getId()) {
            throw new InvalidArgumentException('Cannot follow yourself.');
        }

        if ($follower->getSubscription()->contains($target)) {
            throw new InvalidArgumentException('Already following this user.');
        }

        $follower->addSubscription($target);
        $this->userRepository->save($follower, true);

        return true;
    }

    public function unfollowUser(User $follower, User $target): bool
    {
        if (!$follower->getSubscription()->contains($target)) {
            throw new InvalidArgumentException('Not following this user.');
        }

        $follower->removeSubscription($target);
        $this->userRepository->save($follower, true);

        return true;
    }
}
