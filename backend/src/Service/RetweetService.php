<?php

namespace App\Service;

use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use InvalidArgumentException;

/**
 * Service responsable de la logique de Retweet (copie physique d'un post).
 */
class RetweetService
{
    public function __construct(
        private PostRepository $postRepository,
    ) {
    }

    /**
     * Crée un retweet = copie physique du post original.
     * Les modifications futures de l'original n'affecteront pas le retweet.
     */
    public function retweet(Post $original, User $retweeter): Post
    {
        // Interdire de retweeter son propre post
        if ($original->getAuthor() === $retweeter) {
            throw new InvalidArgumentException('Vous ne pouvez pas retweeter votre propre post.');
        }

        // Interdire de retweeter un post censuré
        if ($original->isCensored()) {
            throw new InvalidArgumentException('Impossible de retweeter un contenu censuré.');
        }

        // Vérifier si ce post est déjà un retweet (empêcher le retweet de retweet)
        if ($original->isRetweet()) {
            throw new InvalidArgumentException('Impossible de retweeter un retweet.');
        }

        // Vérifier si l'utilisateur a déjà retweeté ce post
        $existing = $this->postRepository->findOneBy([
            'RetweetedBy' => $retweeter,
            'OriginalPostId' => $original->getId(),
            'isRetweet' => true,
        ]);
        if ($existing !== null) {
            throw new InvalidArgumentException('Vous avez déjà retweeté ce post.');
        }

        // Créer la copie physique
        $retweet = new Post();
        $retweet->setTextContent($original->getRawTextContent());
        $retweet->setMediaUrl($original->getMediaUrl());
        $retweet->setCreatedAt(new \DateTimeImmutable());
        $retweet->setAuthor($retweeter);
        $retweet->setIsRetweet(true);
        $retweet->setOriginalAuthorUsername($original->getAuthor()?->getUsername());
        $retweet->setRetweetedBy($retweeter);
        $retweet->setOriginalPostId($original->getId());
        $retweet->setIsCensored(false);

        $this->postRepository->save($retweet, true);

        return $retweet;
    }
}
