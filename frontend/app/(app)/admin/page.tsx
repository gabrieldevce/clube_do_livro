'use client';

import Link from 'next/link';
import { useStats } from '@/lib/hooks/useData';
import { Card } from '@/components/Card';

export default function AdminPage() {
  const { data: stats } = useStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Painel administrativo</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Gerencie votações, mídias, avaliações e visualize estatísticas do clube.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/votes">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700">
            <h2 className="font-semibold">Votações</h2>
            <p className="mt-1 text-sm text-stone-500">Criar e fechar sessões de votação</p>
          </Card>
        </Link>
        <Link href="/admin/media">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700">
            <h2 className="font-semibold">Mídias</h2>
            <p className="mt-1 text-sm text-stone-500">Editar e aprovar sugestões</p>
          </Card>
        </Link>
        <Link href="/admin/reviews">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700">
            <h2 className="font-semibold">Avaliações</h2>
            <p className="mt-1 text-sm text-stone-500">Moderar avaliações</p>
          </Card>
        </Link>
        <Link href="/admin/seasons">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700">
            <h2 className="font-semibold">Temporadas</h2>
            <p className="mt-1 text-sm text-stone-500">Gerenciar temporadas do clube</p>
          </Card>
        </Link>
        <Link href="/admin/analytics">
          <Card className="hover:border-primary-300 dark:hover:border-primary-700">
            <h2 className="font-semibold">Analytics</h2>
            <p className="mt-1 text-sm text-stone-500">Gêneros, avaliações e membros ativos</p>
          </Card>
        </Link>
      </div>

      {stats && (
        <Card>
          <h2 className="text-lg font-semibold">Resumo rápido</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {stats.topGenres?.length > 0 && (
              <div>
                <p className="text-sm text-stone-500">Gêneros mais votados</p>
                <ul className="mt-1 text-sm">
                  {stats.topGenres.slice(0, 5).map((g) => (
                    <li key={g.genre}>{g.genre}: {g.count}</li>
                  ))}
                </ul>
              </div>
            )}
            {stats.mostActiveUsers?.length > 0 && (
              <div>
                <p className="text-sm text-stone-500">Membros mais ativos</p>
                <ul className="mt-1 text-sm">
                  {stats.mostActiveUsers.slice(0, 5).map((u) => (
                    <li key={u.id}>{u.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
