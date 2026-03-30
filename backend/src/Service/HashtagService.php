<?php

namespace App\Service;

use App\Entity\Hashtag;
use App\Entity\Post;
use App\Repository\HashtagRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Service responsable du parsing et de la gestion des hashtags et mentions.
 */
class HashtagService
{
    public function __construct(
        private HashtagRepository $hashtagRepository,
        private EntityManagerInterface $em,
    ) {
    }

    /**
     * Extrait les hashtags (#tag) d'un texte.
     *
     * @return string[] Liste des noms de hashtags (sans le #, en minuscules)
     */
    public function extractHashtags(string $text): array
    {
        preg_match_all('/(?<=\s|^)#(\w+)/u', $text, $matches);

        return array_unique(array_map('mb_strtolower', $matches[1]));
    }

    /**
     * Extrait les mentions (@username) d'un texte.
     *
     * @return string[] Liste des usernames mentionnés (sans le @)
     */
    public function extractMentions(string $text): array
    {
        preg_match_all('/(?<=\s|^)@(\w+)/u', $text, $matches);

        return array_unique($matches[1]);
    }

    /**
     * Parse le contenu d'un post et attache les hashtags correspondants.
     * Supprime les anciens hashtags du post avant d'en attacher de nouveaux.
     */
    public function processPostContent(Post $post): void
    {
        $text = $post->getRawTextContent() ?? '';

        // Supprimer les anciens hashtags
        foreach ($post->getHashtags()->toArray() as $oldHashtag) {
            $post->removeHashtag($oldHashtag);
        }

        // Extraire et attacher les nouveaux hashtags
        $hashtagNames = $this->extractHashtags($text);
        foreach ($hashtagNames as $name) {
            $hashtag = $this->findOrCreate($name);
            $post->addHashtag($hashtag);
        }
    }

    /**
     * Trouve un hashtag par nom ou le crée s'il n'existe pas.
     */
    private function findOrCreate(string $name): Hashtag
    {
        $hashtag = $this->hashtagRepository->findOneBy(['name' => $name]);

        if ($hashtag === null) {
            $hashtag = new Hashtag();
            $hashtag->setName($name);
            $this->em->persist($hashtag);
        }

        return $hashtag;
    }
}
