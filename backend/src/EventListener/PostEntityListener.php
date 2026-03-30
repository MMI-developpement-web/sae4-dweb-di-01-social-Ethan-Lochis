<?php

namespace App\EventListener;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[AsEntityListener(event: Events::preRemove, method: 'preRemove', entity: Post::class)]
#[AsEntityListener(event: Events::preUpdate, method: 'preUpdate', entity: Post::class)]
class PostEntityListener
{
    private ParameterBagInterface $params;
    private LoggerInterface $logger;

    public function __construct(ParameterBagInterface $params, LoggerInterface $logger)
    {
        $this->params = $params;
        $this->logger = $logger;
    }

    public function preRemove(Post $post, LifecycleEventArgs $event): void
    {
        $mediaUrl = $post->getMediaUrl();

        if ($mediaUrl) {
            $this->deleteFile($mediaUrl, 'Post supprimé');
        }
    }

    public function preUpdate(Post $post, PreUpdateEventArgs $event): void
    {
        // Vérifier si le champ media_url a changé
        if ($event->hasChangedField('media_url')) {
            $oldMediaUrl = $event->getOldValue('media_url');

            // Si l'ancienne URL existe, supprimer l'ancien fichier
            if ($oldMediaUrl) {
                $this->deleteFile($oldMediaUrl, 'Post mis à jour, ancienne image supprimée');
            }
        }
    }

    /**
     * Supprime un fichier uploadé
     */
    private function deleteFile(string $mediaUrl, string $reason): void
    {
        try {
            $projectDir = $this->params->get('kernel.project_dir');
            $filePath = $projectDir . '/public' . $mediaUrl;

            if (file_exists($filePath)) {
                // Vérifier que le fichier est bien dans le répertoire uploads (sécurité)
                $realPath = realpath($filePath);
                $allowedDir = realpath($projectDir . '/public/uploads');
                
                if ($realPath && strpos($realPath, $allowedDir) === 0) {
                    if (is_writable($filePath)) {
                        if (@unlink($filePath)) {
                            $this->logger->info('Fichier supprimé avec succès', [
                                'file' => $mediaUrl,
                                'reason' => $reason
                            ]);
                        } else {
                            $this->logger->warning('Impossible de supprimer le fichier (unlink échoué)', [
                                'file' => $mediaUrl,
                                'path' => $filePath
                            ]);
                        }
                    } else {
                        $this->logger->warning('Pas de permission d\'écriture pour supprimer le fichier', [
                            'file' => $mediaUrl,
                            'path' => $filePath
                        ]);
                    }
                } else {
                    $this->logger->warning('Tentative de suppression d\'un fichier en dehors du répertoire uploads', [
                        'file' => $mediaUrl
                    ]);
                }
            } else {
                $this->logger->info('Fichier n\'existe pas, rien à supprimer', [
                    'file' => $mediaUrl
                ]);
            }
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la suppression du fichier', [
                'file' => $mediaUrl,
                'error' => $e->getMessage()
            ]);
        }
    }
}
