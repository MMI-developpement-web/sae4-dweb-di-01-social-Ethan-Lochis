<?php

namespace App\EventListener;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[AsEntityListener(event: Events::preRemove, method: 'preRemove', entity: Post::class)]
#[AsEntityListener(event: Events::preUpdate, method: 'preUpdate', entity: Post::class)]
class PostEntityListener
{
    private $params;

    public function __construct(ParameterBagInterface $params)
    {
        $this->params = $params;
    }

    public function preRemove(Post $post, LifecycleEventArgs $event): void
    {
        $mediaUrl = $post->getMediaUrl();

        if ($mediaUrl) {
            $projectDir = $this->params->get('kernel.project_dir');
            $filePath = $projectDir . '/public' . $mediaUrl;

            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
    }

    public function preUpdate(Post $post, PreUpdateEventArgs $event): void
    {
        // Vérifier si le champ media_url a changé
        if ($event->hasChangedField('media_url')) {
            $oldMediaUrl = $event->getOldValue('media_url');

            // Si l'ancienne URL existe, supprimer l'ancien fichier
            if ($oldMediaUrl) {
                $projectDir = $this->params->get('kernel.project_dir');
                $oldFilePath = $projectDir . '/public' . $oldMediaUrl;

                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }
        }
    }
}
