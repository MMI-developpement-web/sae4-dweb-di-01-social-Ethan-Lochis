<?php

namespace App\Entity;

use App\Repository\PostRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 510)]
    private ?string $TextContent = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $CreatedAt = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $Author = null;

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
}