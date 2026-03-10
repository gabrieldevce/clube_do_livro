'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStats } from '@/lib/hooks/useData';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <p className="font-medium">Acesso negado. Apenas administradores podem acessar esta área.</p>
        <Link href="/" className="mt-2 inline-block text-primary-600 hover:underline dark:text-primary-400">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      <aside className="w-48 flex-shrink-0 space-y-1 border-r border-stone-200 pr-6 dark:border-stone-700">
        <Link href="/admin" className="block font-medium hover:underline">Visão geral</Link>
        <Link href="/admin/votes" className="block text-stone-600 hover:underline dark:text-stone-400">Votações</Link>
        <Link href="/admin/media" className="block text-stone-600 hover:underline dark:text-stone-400">Mídias</Link>
        <Link href="/admin/reviews" className="block text-stone-600 hover:underline dark:text-stone-400">Avaliações</Link>
        <Link href="/admin/seasons" className="block text-stone-600 hover:underline dark:text-stone-400">Temporadas</Link>
        <Link href="/admin/analytics" className="block text-stone-600 hover:underline dark:text-stone-400">Analytics</Link>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
