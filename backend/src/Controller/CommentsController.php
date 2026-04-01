<?php

namespace App\Controller;

use App\Entity\Comments;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\CommentsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/posts')]
class CommentsController extends AbstractController
{
    #[Route('/{id}/comments', name: 'post_comments_list', methods: ['GET'])]
    public function listComments(Post $post, Request $request, CommentsRepository $commentsRepository): JsonResponse
    {
        $limit = max(1, $request->query->getInt('limit', 7));
        $offset = max(0, $request->query->getInt('offset', 0));

        // Let's get them by oldest to newest, so "charger plus" brings older? Or newest first?
        // Usually newest replies are at the top, or replies to posts are oldest first. Let's do DESC by created at for newest first like posts.
        $comments = $commentsRepository->findBy(
            ['CommentOf' => $post],
            ['CreatedAt' => 'DESC'],
            $limit,
            $offset
        );

        return $this->json($comments, 200, [], ['groups' => ['comment:read']]);
    }

    #[Route('/{id}/comments', name: 'post_comments_add', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function addComment(Post $post, Request $request, EntityManagerInterface $em, SerializerInterface $serializer, ValidatorInterface $validator): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        // Decode the JSON request
        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['TextContent']) || empty(trim($data['TextContent']))) {
            return $this->json(['error' => 'Le contenu du commentaire ne peut pas être vide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Vérifier si le profil de l'auteur est en lecture seule (US 2.3)
        $postAuthor = $post->getAuthor();
        if ($postAuthor && $postAuthor->isReadOnly()) {
            return $this->json(['error' => 'Ce profil est en lecture seule. Les commentaires sont désactivés.'], JsonResponse::HTTP_FORBIDDEN);
        }

        // Vérifier si l'auteur du post a bloqué l'utilisateur courant
        if ($postAuthor && $postAuthor->getBlocked()->contains($user)) {
            return $this->json(['error' => 'Vous ne pouvez pas interagir avec ce contenu.'], JsonResponse::HTTP_FORBIDDEN);
        }

        $comment = new Comments();
        $comment->setTextContent(trim($data['TextContent']));
        $comment->setAuthor($user);
        $comment->setCommentOf($post);
        $comment->setCreatedAt(new \DateTimeImmutable());

        $errors = $validator->validate($comment);
        if (count($errors) > 0) {
            return $this->json(['error' => (string) $errors], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $em->persist($comment);
        $em->flush();

        return $this->json($comment, JsonResponse::HTTP_CREATED, [], ['groups' => ['comment:read']]);
    }

    #[Route('/comments/{id}', name: 'post_comments_update', methods: ['POST'])]
    public function updateComment(int $id, Request $request, CommentsRepository $commentsRepository, EntityManagerInterface $em, #[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['error' => 'Vous devez être connecté pour modifier un commentaire.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $comment = $commentsRepository->find($id);
        if (!$comment) {
            return $this->json(['error' => 'Commentaire non trouvé.'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($comment->getAuthor() !== $user) {
            return $this->json(['error' => 'Vous n\'êtes pas autorisé à modifier ce commentaire.'], JsonResponse::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $content = $data['TextContent'] ?? null;

        if (!$content || empty(trim($content))) {
            return $this->json(['error' => 'Le contenu du commentaire ne peut pas être vide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $comment->setTextContent(trim($content));
        $em->flush();

        return $this->json($comment, JsonResponse::HTTP_OK, [], ['groups' => ['comment:read']]);
    }

    #[Route('/comments/{id}', name: 'post_comments_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function deleteComment(int $id, CommentsRepository $commentsRepository, EntityManagerInterface $em, #[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json(['error' => 'Vous devez être connecté pour supprimer un commentaire.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $comment = $commentsRepository->find($id);
        if (!$comment) {
            return $this->json(['error' => 'Commentaire non trouvé.'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($comment->getAuthor() !== $user && !in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'Vous n\'êtes pas autorisé à supprimer ce commentaire.'], JsonResponse::HTTP_FORBIDDEN);
        }

        $em->remove($comment);
        $em->flush();

        return $this->json(null, JsonResponse::HTTP_NO_CONTENT);
    }
}
