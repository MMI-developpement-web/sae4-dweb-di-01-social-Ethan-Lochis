<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use \Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['post:read', 'comment:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 22, unique: true)]
    #[Groups(['post:read', 'comment:read'])]
    private ?string $username = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $email = null;

    #[ORM\Column(length: 500)]
    private ?string $password = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['post:read', 'comment:read'])]
    private ?string $profilePicture = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['post:read', 'comment:read'])]
    private ?string $bio = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['post:read', 'comment:read'])]
    private ?string $location = null;

    #[Groups(['post:read', 'comment:read'])]
    private bool $isFollowedByCurrentUser = false;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    /**
     * @var Collection<int, Post>
     */
    #[ORM\OneToMany(targetEntity: Post::class, mappedBy: 'Author')]
    private Collection $posts;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?ApiToken $apiToken = null;

    /**
     * @var Collection<int, Post>
     */
    #[ORM\ManyToMany(targetEntity: Post::class, mappedBy: 'LikedBy')]
    private Collection $Liked;

    /**
     * @var Collection<int, self>
     */
    #[ORM\ManyToMany(targetEntity: self::class, inversedBy: 'Subscribed')]
    #[ORM\JoinTable(name: 'Subscriptions')]
    #[ORM\JoinColumn(name: 'follower_id', referencedColumnName: 'id')]
    #[ORM\InverseJoinColumn(name: 'following_id', referencedColumnName: 'id')]
    private Collection $Subscription;

    /**
     * @var Collection<int, self>
     */
    #[ORM\ManyToMany(targetEntity: self::class, mappedBy: 'Subscription')]
    private Collection $Subscibed;

    #[ORM\Column(nullable: false)]
    private bool $isBlocked = false;

    /**
     * @var Collection<int, Comments>
     */
    #[ORM\OneToMany(targetEntity: Comments::class, mappedBy: 'author', orphanRemoval: true)]
    private Collection $Comments;

    /**
     * @var Collection<int, self>
     */
    #[ORM\ManyToMany(targetEntity: self::class, inversedBy: 'Blocked')]
    private Collection $Blocked;
    #[ORM\JoinColumn(name: 'Following', referencedColumnName: 'id')]
    #[ORM\InverseJoinColumn(name: 'Followed', referencedColumnName: 'id')]

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->Liked = new ArrayCollection();
        $this->Subscription = new ArrayCollection();
        $this->Subscibed = new ArrayCollection();
        $this->Comments = new ArrayCollection();
        $this->Blocked = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;
        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    /**
     * Méthode obligatoire pour UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->username;
    }

    /**
     * Méthode obligatoire pour PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getProfilePicture(): ?string
    {
        return $this->profilePicture;
    }

    public function setProfilePicture(?string $profilePicture): static
    {
        $this->profilePicture = $profilePicture;
        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;
        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;
        return $this;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        // Garantit que chaque utilisateur a au moins ROLE_USER
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // Utile si on stockes des données sensibles temporaires
    }

    /**
     * @return Collection<int, Post>
     */
    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Post $post): static
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setAuthor($this);
        }
        return $this;
    }

    public function removePost(Post $post): static
    {
        if ($this->posts->removeElement($post)) {
            if ($post->getAuthor() === $this) {
                $post->setAuthor(null);
            }
        }
        return $this;
    }

    public function getApiToken(): ?ApiToken
    {
        return $this->apiToken;
    }

    public function setApiToken(?ApiToken $apiToken): static
    {
        // unset the owning side of the relation if necessary
        if ($apiToken === null && $this->apiToken !== null) {
            $this->apiToken->setUser(null);
        }

        // set the owning side of the relation if necessary
        if ($apiToken !== null && $apiToken->getUser() !== $this) {
            $apiToken->setUser($this);
        }

        $this->apiToken = $apiToken;

        return $this;
    }

    /**
     * @return Collection<int, Post>
     */
    public function getLiked(): Collection
    {
        return $this->Liked;
    }

    public function addLiked(Post $liked): static
    {
        if (!$this->Liked->contains($liked)) {
            $this->Liked->add($liked);
            $liked->addLikedBy($this);
        }

        return $this;
    }

    public function removeLiked(Post $liked): static
    {
        if ($this->Liked->removeElement($liked)) {
            $liked->removeLikedBy($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getSubscription(): Collection
    {
        return $this->Subscription;
    }

    public function addSubscription(self $subscription): static
    {
        if (!$this->Subscription->contains($subscription)) {
            $this->Subscription->add($subscription);
        }

        return $this;
    }

    public function removeSubscription(self $subscription): static
    {
        $this->Subscription->removeElement($subscription);

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getSubscibed(): Collection
    {
        return $this->Subscibed;
    }

    public function addSubscibed(self $subscibed): static
    {
        if (!$this->Subscibed->contains($subscibed)) {
            $this->Subscibed->add($subscibed);
            $subscibed->addSubscription($this);
        }

        return $this;
    }

    public function removeSubscibed(self $subscibed): static
    {
        if ($this->Subscibed->removeElement($subscibed)) {
            $subscibed->removeSubscription($this);
        }

        return $this;
    }

    public function getIsFollowedByCurrentUser(): bool
    {
        return $this->isFollowedByCurrentUser;
    }

    public function setIsFollowedByCurrentUser(bool $isFollowedByCurrentUser): static
    {
        $this->isFollowedByCurrentUser = $isFollowedByCurrentUser;
        return $this;
    }

    public function isBlocked(): ?bool
    {
        return $this->isBlocked;
    }

    public function setIsBlocked(?bool $isBlocked): static
    {
        $this->isBlocked = $isBlocked;

        return $this;
    }

    /**
     * Vérifie si l'utilisateur a le rôle ROLE_ADMIN
     */
    public function isAdmin(): bool
    {
        return in_array('ROLE_ADMIN', $this->roles, true);
    }

    /**
     * Ajoute ou supprime le rôle ROLE_ADMIN
     */
    public function setAdmin(bool $isAdmin): static
    {
        if ($isAdmin && !$this->isAdmin()) {
            // Ajouter le rôle
            $this->roles[] = 'ROLE_ADMIN';
        } elseif (!$isAdmin && $this->isAdmin()) {
            // Supprimer le rôle
            $this->roles = array_filter($this->roles, fn($role) => $role !== 'ROLE_ADMIN');
        }
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
            $comment->setAuthor($this);
        }

        return $this;
    }

    public function removeComment(Comments $comment): static
    {
        if ($this->Comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getAuthor() === $this) {
                $comment->setAuthor(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getBlocked(): Collection
    {
        return $this->Blocked;
    }

    public function addBlocked(self $blocked): static
    {
        if (!$this->Blocked->contains($blocked)) {
            $this->Blocked->add($blocked);
        }

        return $this;
    }

    public function removeBlocked(self $blocked): static
    {
        $this->Blocked->removeElement($blocked);

        return $this;
    }
}
