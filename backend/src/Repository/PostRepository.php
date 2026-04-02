<?php

namespace App\Repository;

use App\Entity\Post;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Post>
 */
class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    public function save(Post $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Post $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return Post[] Returns an array of Post objects ordered by ID descending
     */
    public function findLatest(?int $limit = null, ?int $offset = null): array
    {
        return $this->findBy([], ['id' => 'DESC'], $limit, $offset);
    }

    /**
     * Retourne uniquement les posts des personnes suivies.
     * @return Post[]
     */
    public function findFollowing(User $currentUser, ?int $limit = null, ?int $offset = null): array
    {
        if ($currentUser->getSubscription()->isEmpty()) {
            return [];
        }

        $followedIds = array_map(fn($u) => $u->getId(), $currentUser->getSubscription()->toArray());

        $qb = $this->createQueryBuilder('p')
            ->where('p.Author IN (:followedIds)')
            ->setParameter('followedIds', $followedIds)
            ->orderBy('p.id', 'DESC');

        if ($limit !== null) {
            $qb->setMaxResults($limit);
        }
        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @return Post[] Returns an array of Post objects for a specific author ordered by ID descending
     */
    public function findByAuthor(int $authorId): array
    {
        return $this->findBy(['Author' => $authorId], ['id' => 'DESC']);
    }

    /**
     * @return Post[]
     */
    public function searchFiltered(string $query, ?int $limit = null, ?int $offset = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->orderBy('p.id', 'DESC');

        if (str_starts_with($query, '#')) {
            $hashtagName = mb_strtolower(substr($query, 1));
            $qb->join('p.hashtags', 'h')
               ->andWhere('h.name = :hashtag')
               ->setParameter('hashtag', $hashtagName);
        } elseif (str_starts_with($query, '@')) {
            $username = substr($query, 1);
            $qb->join('p.Author', 'a')
               ->andWhere('a.username LIKE :username')
               ->setParameter('username', '%' . $username . '%');
        } else {
            $qb->andWhere('p.TextContent LIKE :query')
               ->setParameter('query', '%' . $query . '%');
        }

        if ($limit !== null) {
            $qb->setMaxResults($limit);
        }
        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @param int[] $postIds
     * @return array<int, int> Map de post ID => nombre de retweets
     */
    public function getRetweetsCounts(array $postIds): array
    {
        if (empty($postIds)) {
            return [];
        }

        $qb = $this->createQueryBuilder('p')
            ->select('p.OriginalPostId, COUNT(p.id) as retweetsCount')
            ->where('p.OriginalPostId IN (:postIds)')
            ->andWhere('p.isRetweet = true')
            ->setParameter('postIds', $postIds)
            ->groupBy('p.OriginalPostId');

        $results = $qb->getQuery()->getResult();
        $counts = [];
        foreach ($results as $row) {
            $counts[$row['OriginalPostId']] = (int) $row['retweetsCount'];
        }

        return $counts;
    }
}
