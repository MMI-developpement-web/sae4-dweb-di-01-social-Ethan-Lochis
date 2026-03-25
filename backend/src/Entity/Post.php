<?php

namespace App\Entity;

use App\Repository\PostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use \Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['post:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 510)]
    #[Groups(['post:read'])]
    private ?string $TextContent = null;

    #[ORM\Column]
    #[Groups(['post:read'])]
    private ?\DateTimeImmutable $CreatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['post:read'])]
    private ?User $Author = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'Liked')]
    #[ORM\JoinTable(name: 'likes')]
    private Collection $LikedBy;

    public function __construct()
    {
        $this->LikedBy = new ArrayCollection();
        $this->Comments = new ArrayCollection();
    }

    #[Groups(['post:read'])]
    public function getLikesCount(): int
    {
        if ($this->Author && $this->Author->isBlocked()) {
            return 0;
        }
        return $this->LikedBy->count();
    }

    private bool $isLikedByCurrentUser = false;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['post:read', 'post:write'])]
    private ?string $media_url = null;

    /**
     * @var Collection<int, Comments>
     */
    #[ORM\OneToMany(targetEntity: Comments::class, mappedBy: 'CommentOf', orphanRemoval: true)]
    private Collection $Comments;

    #[Groups(['post:read'])]
    public function getIsLikedByCurrentUser(): bool
    {
        if ($this->Author && $this->Author->isBlocked()) {
            return false;
        }
        return $this->isLikedByCurrentUser;
    }

    public function setIsLikedByCurrentUser(bool $isLiked): static
    {
        $this->isLikedByCurrentUser = $isLiked;
        return $this;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTextContent(): ?string
    {
        if ($this->Author && $this->Author->isBlocked()) {
            return "⚠️ Ce compte a été bloqué pour non respect des conditions d’utilisation ⚠️";
        }
        return $this->TextContent;
    }

    public function setTextContent(string $TextContent): static
    {
        $this->TextContent = $TextContent;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->CreatedAt;
    }

    public function setCreatedAt(\DateTimeImmutable $CreatedAt): static
    {
        $this->CreatedAt = $CreatedAt;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->Author;
    }

    public function setAuthor(?User $Author): static
    {
        $this->Author = $Author;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getLikedBy(): Collection
    {
        if ($this->Author && $this->Author->isBlocked()) {
            return new ArrayCollection();
        }
        return $this->LikedBy;
    }

    public function addLikedBy(User $likedBy): static
    {
        if (!$this->LikedBy->contains($likedBy)) {
            $this->LikedBy->add($likedBy);
        }

        return $this;
    }

    public function removeLikedBy(User $likedBy): static
    {
        $this->LikedBy->removeElement($likedBy);

        return $this;
    }

    #[Groups(['post:read'])]
    public function getMediaUrl(): ?string
    {
        return $this->media_url;
    }

    #[Groups(['post:read'])]
    public function getCommentsCount(): int
    {
        return $this->Comments ? $this->Comments->count() : 0;
    }

    public function setMediaUrl(?string $media_url): static
    {
        $this->media_url = $media_url;

        return $this;
    }

    /**
     * @return Collection<int, Comments>
     */
    public function getComments(): Collection
    {
        return $this->Comments;
    }

    public function addComment(Comments $comment): static
    {
        if (!$this->Comments->contains($comment)) {
            $this->Comments->add($comment);
            $comment->setCommentOf($this);
        }

        return $this;
    }

    public function removeComment(Comments $comment): static
    {
        if ($this->Comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getCommentOf() === $this) {
                $comment->setCommentOf(null);
            }
        }

        return $this;
    }
}