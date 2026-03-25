<?php

namespace App\Entity;

use App\Repository\CommentsRepository;
use Doctrine\ORM\Mapping as ORM;
use \Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: CommentsRepository::class)]
class Comments
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['comment:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 510)]
    #[Groups(['comment:read'])]
    private ?string $TextContent = null;

    #[ORM\ManyToOne(inversedBy: 'Comments')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['comment:read'])]
    private ?User $author = null;

    #[ORM\Column]
    #[Groups(['comment:read'])]
    private ?\DateTimeImmutable $CreatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'Comments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Post $CommentOf = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTextContent(): ?string
    {
        return $this->TextContent;
    }

    public function setTextContent(string $TextContent): static
    {
        $this->TextContent = $TextContent;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

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

    public function getCommentOf(): ?Post
    {
        return $this->CommentOf;
    }

    public function setCommentOf(?Post $CommentOf): static
    {
        $this->CommentOf = $CommentOf;

        return $this;
    }
}
