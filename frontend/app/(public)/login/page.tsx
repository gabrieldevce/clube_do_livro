'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginError, isLoading } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login({ email, password });
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <p className="mt-1 text-stone-600 dark:text-stone-400">
        Acesse sua conta do Clube dos Filmes
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
          />
        </div>
        {loginError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {(loginError as Error).message}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary-600 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-stone-500">
        Não tem conta?{' '}
        <Link href="/register" className="text-primary-600 hover:underline dark:text-primary-400">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
