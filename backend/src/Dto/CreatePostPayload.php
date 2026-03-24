<?php

namespace App\Dto;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Assert;

class CreatePostPayload
{
    #[Assert\NotBlank(message: 'Le contenu du post ne peut pas être vide.')]
    #[Assert\Length(
        max: 510,
        maxMessage: 'Le contenu ne doit pas dépasser 510 caractères.'
    )]
    public string $textContent = '';

    #[Assert\File(
        maxSize: '30M',
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'],
        mimeTypesMessage: 'Veuillez uploader une image (JPEG, PNG, GIF) ou une vidéo (MP4, WebM) valide.'
    )]
    public ?UploadedFile $media = null;

    public function getTextContent(): string
    {
        return $this->textContent;
    }

    public function setTextContent(string $textContent): self
    {
        $this->textContent = $textContent;
        return $this;
    }

    public function getMedia(): ?UploadedFile
    {
        return $this->media;
    }

    public function setMedia(?UploadedFile $media): self
    {
        $this->media = $media;
        return $this;
    }
}
