'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGamification, useVoteSessions, useRecommendations } from '@/lib/hooks/useData';
import { Card } from '@/components/Card';
import { MediaCard } from '@/components/MediaCard';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: gamification } = useGamification();
  const { data: openVotes } = useVoteSessions('OPEN');
  const { data: suggestions } = useRecommendations();

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="font-medium">Faça login para acessar seu painel.</p>
        <Link href="/login" className="mt-2 inline-block text-primary-600 hover:underline dark:text-primary-400">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Seu painel</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Seu progresso</h2>
        <Card className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400">Pontos</p>
            <p className="text-2xl font-bold">{gamification?.points ?? user.points}</p>
          </div>
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400">Nível</p>
            <p className="text-xl font-semibold">{gamification?.level ?? user.level}</p>
          </div>
          {gamification?.badges && gamification.badges.length > 0 && (
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Distintivos</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {gamification.badges.map((ub: { badge: { name: string; code: string } }) => (
                  <span
                    key={ub.badge.code}
                    className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900/50 dark:text-primary-200"
                  >
                    {ub.badge.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>

      {openVotes && openVotes.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Votações abertas</h2>
          <ul className="space-y-2">
            {openVotes.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/votes?session=${s.id}`}
                  className="block rounded-lg border border-stone-200 p-3 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800/50"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestions && suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Sugestões para você</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {suggestions.slice(0, 8).map((m) => (
              <MediaCard key={m.id} media={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
