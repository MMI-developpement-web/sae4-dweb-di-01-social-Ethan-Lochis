<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\Response;

class CorsSubscriber implements EventSubscriberInterface
{
    private string $allowedOriginPattern;

    public function __construct()
    {
        $this->allowedOriginPattern = $_ENV['CORS_ALLOW_ORIGIN'] ?? 'http://localhost:5173';
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 9999],
            KernelEvents::RESPONSE => ['onKernelResponse', 9999],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $method = $request->getRealMethod();

        if ('OPTIONS' === $method) {
            $response = new Response();
            $event->setResponse($response);
        }
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $response = $event->getResponse();
        
        // Déterminer l'origin approprié
        $origin = $request->headers->get('Origin');
        $allowedOrigin = $this->isOriginAllowed($origin) ? $origin : null;
        
        if ($allowedOrigin) {
            $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }
    }

    private function isOriginAllowed(?string $origin): bool
    {
        if (!$origin) {
            return false;
        }

        // Si c'est une regex pattern, utiliser preg_match
        if (strpos($this->allowedOriginPattern, '^') === 0 || strpos($this->allowedOriginPattern, '*') !== false) {
            return (bool) preg_match('#' . $this->allowedOriginPattern . '#', $origin);
        }

        // Sinon comparaison directe
        return $origin === $this->allowedOriginPattern;
    }
}
