<?php

namespace App\Repository;

use App\Entity\Post;
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
    public function findLatest(): array
    {
        return $this->findBy([], ['id' => 'DESC']);
    }

    /**
     * @return Post[] Returns an array of Post objects for a specific author ordered by ID descending
     */
    public function findByAuthor(int $authorId): array
    {
        return $this->findBy(['Author' => $authorId], ['id' => 'DESC']);
    }
}
