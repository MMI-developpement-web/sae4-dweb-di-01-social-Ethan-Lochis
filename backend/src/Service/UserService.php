<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use InvalidArgumentException;

class UserService
{
    private string $projectDir;

    public function __construct(
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        ParameterBagInterface $parameterBag
    ) {
        $this->projectDir = $parameterBag->get('kernel.project_dir');
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

        // Vérifier si le target a bloqué le follower
        if ($target->getBlocked()->contains($follower)) {
            throw new InvalidArgumentException('Vous ne pouvez pas suivre cet utilisateur.');
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

    public function blockUser(User $blocker, User $target): bool
    {
        if ($blocker->getId() === $target->getId()) {
            throw new InvalidArgumentException('Vous ne pouvez pas vous bloquer vous-même.');
        }

        if ($blocker->getBlocked()->contains($target)) {
            throw new InvalidArgumentException('Cet utilisateur est déjà bloqué.');
        }

        // Ajouter le blocage
        $blocker->addBlocked($target);

        // Désabonner automatiquement le target s'il suivait le blocker
        if ($target->getSubscription()->contains($blocker)) {
            $target->removeSubscription($blocker);
        }

        $this->userRepository->save($blocker, true);
        $this->userRepository->save($target, true);

        return true;
    }

    public function unblockUser(User $blocker, User $target): bool
    {
        if (!$blocker->getBlocked()->contains($target)) {
            throw new InvalidArgumentException('Cet utilisateur n\'est pas bloqué.');
        }

        $blocker->removeBlocked($target);
        $this->userRepository->save($blocker, true);

        return true;
    }

    private const ALLOWED_PROFILE_MIMES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    ];

    public function handleMediaUpload($uploadedFile): string
    {
        $mimeType = $uploadedFile->getMimeType();
        if (!in_array($mimeType, self::ALLOWED_PROFILE_MIMES, true)) {
            throw new InvalidArgumentException('Type de fichier non autorisé. Formats acceptés : JPEG, PNG, GIF, WebP.');
        }

        try {
            $fileName = bin2hex(random_bytes(8));
            $extension = $uploadedFile->guessExtension() ?? 'bin';
            $newFileName = $fileName . '.' . $extension;

            $uploadDir = $this->projectDir . '/public/uploads/profiles';

            if (!is_dir($uploadDir) && !@mkdir($uploadDir, 0755, true)) {
                throw new InvalidArgumentException('Failed to create upload directory.');
            }

            $uploadedFile->move($uploadDir, $newFileName);

            return '/uploads/profiles/' . $newFileName;
        } catch (\Exception $e) {
            throw new InvalidArgumentException('Error uploading profile picture: ' . $e->getMessage());
        }
    }
}
