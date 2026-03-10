const API_BASE = typeof window === 'undefined' ? '' : '/api';

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || 'Erro na requisição');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET', token }),

  post: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, token }),

  patch: <T>(path: string, body?: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, token }),

  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE', token }),
};
