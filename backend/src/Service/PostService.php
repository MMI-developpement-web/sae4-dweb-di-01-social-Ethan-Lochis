<?php

namespace App\Service;

use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use InvalidArgumentException;

class PostService
{
    public function __construct(
        private PostRepository $postRepository
    ) {
    }

    public function createPost(array $data, User $author): Post
    {
        if (empty($data['textContent'])) {
            throw new InvalidArgumentException('Missing textContent for the post.');
        }

        if (strlen($data['textContent']) > 510) {
            throw new InvalidArgumentException('Post content is too long (maximum 510 characters).');
        }

        $post = new Post();
        $post->setTextContent($data['textContent']);
        $post->setCreatedAt(new \DateTimeImmutable());
        $post->setAuthor($author);

        // Délégation de la sauvegarde au Repository
        $this->postRepository->save($post, true);

        return $post;
    }

    public function toggleLike(Post $post, User $user): array
    {
        if ($post->getLikedBy()->contains($user)) {
            $post->removeLikedBy($user);
            $isLiked = false;
        } else {
            $post->addLikedBy($user);
            $isLiked = true;
        }

        $this->postRepository->save($post, true);

        return [
            'liked' => $isLiked,
            'likesCount' => $post->getLikedBy()->count(),
        ];
    }
}
