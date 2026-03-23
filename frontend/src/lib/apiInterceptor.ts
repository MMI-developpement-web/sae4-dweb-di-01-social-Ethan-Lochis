// src/lib/apiInterceptor.ts
/**
 * Intercepteur API pour gérer les erreurs d'authentification
 * Capture les erreurs 401 et dispatch l'événement auth:unauthorized
 */
export function setupAPIInterceptor() {
  // Intercepter les réponses fetch
  const originalFetch = window.fetch;

  window.fetch = async function (...args: any[]) {
    try {
      const response = await originalFetch.apply(window, args);

      // Si erreur 401 (Unauthorized)
      if (response.status === 401) {
        try {
          const data = await response.clone().json();
          const message = data.error || 'Vous avez été déconnecté';
          
          // Dispatcher l'événement d'authentification échouée avec le message
          const event = new CustomEvent('auth:unauthorized', {
            detail: { reason: message }
          });
          window.dispatchEvent(event);
        } catch {
          // Si pas d'erreur JSON, dispatcher avec message générique
          const event = new CustomEvent('auth:unauthorized', {
            detail: { reason: 'Erreur d\'authentification' }
          });
          window.dispatchEvent(event);
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  } as any;
}
