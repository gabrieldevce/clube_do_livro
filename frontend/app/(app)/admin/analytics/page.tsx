'use client';

import { useStats } from '@/lib/hooks/useData';
import { Card } from '@/components/Card';
import { MediaCard } from '@/components/MediaCard';

export default function AdminAnalyticsPage() {
  const { data: stats } = useStats();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Gêneros mais assistidos, mídias melhor avaliadas e membros mais ativos.
      </p>

      {stats?.topGenres && stats.topGenres.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold">Gêneros mais votados / assistidos</h2>
          <ul className="mt-3 space-y-1">
            {stats.topGenres.map((g) => (
              <li key={g.genre} className="flex justify-between text-sm">
                <span>{g.genre}</span>
                <span className="text-stone-500">{g.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {stats?.topRatedMedia && stats.topRatedMedia.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold">Mídias melhor avaliadas</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {stats.topRatedMedia.slice(0, 8).map((m) => (
              <MediaCard key={m.id} media={m} />
            ))}
          </div>
        </Card>
      )}

      {stats?.mostActiveUsers && stats.mostActiveUsers.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold">Membros mais ativos</h2>
          <ul className="mt-3 space-y-2">
            {stats.mostActiveUsers.map((u) => (
              <li key={u.id} className="flex justify-between text-sm">
                <span>{u.name}</span>
                <span className="text-stone-500">{u.points} pts</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {(!stats || (!stats.topGenres?.length && !stats.topRatedMedia?.length && !stats.mostActiveUsers?.length)) && (
        <p className="text-stone-500">Sem dados de analytics ainda.</p>
      )}
    </div>
  );
}
