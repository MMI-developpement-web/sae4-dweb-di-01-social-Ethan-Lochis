// src/lib/api.ts

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Erreur réseau';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || response.statusText;
    } catch (e) {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
