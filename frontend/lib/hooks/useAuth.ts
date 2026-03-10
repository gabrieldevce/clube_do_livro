'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, setToken, clearToken } from '@/lib/auth';
import type { User } from '@/lib/types';

export function useAuth() {
  const token = typeof window !== 'undefined' ? getToken() : null;
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me', token],
    queryFn: () => api.get<User>('/auth/me', token!),
    enabled: !!token,
  });

  const loginMutation = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api.post<{ access_token: string }>('/auth/login', body),
    onSuccess: (data) => {
      setToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (body: { name: string; email: string; password: string }) =>
      api.post<{ access_token: string }>('/auth/register', body),
    onSuccess: (data) => {
      setToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push('/dashboard');
    },
  });

  const logout = () => {
    clearToken();
    queryClient.clear();
    router.push('/');
  };

  return {
    user: user ?? null,
    token,
    isAuthenticated: !!user,
    isLoading: !!token && isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
