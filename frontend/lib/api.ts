// Em produção (Vercel), use a URL do backend diretamente para não depender do rewrite.
// No browser, NEXT_PUBLIC_API_URL está disponível.
const getApiBase = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
    return process.env.NEXT_PUBLIC_API_URL;
  return typeof window === 'undefined' ? '' : '/api';
};

const API_BASE = getApiBase();

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
