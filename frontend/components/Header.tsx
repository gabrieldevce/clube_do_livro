'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
          PlotTwist
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
            Início
          </Link>
          <Link href="/votes" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
            Votações
          </Link>
          <Link href="/genres" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
            Gêneros
          </Link>
          <Link href="/calendar" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
            Calendário
          </Link>
          <Link href="/ranking" className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
            Ranking
          </Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-accent-600 dark:text-accent-400">
              Admin
            </Link>
          )}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${user.id}`}
                className="rounded-full bg-stone-200 px-3 py-1.5 text-sm font-medium dark:bg-stone-700"
              >
                {user.name}
              </Link>
              <Link href="/dashboard" className="text-sm text-stone-600 dark:text-stone-400">
                Painel
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              >
                Sair
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium dark:border-stone-600"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
