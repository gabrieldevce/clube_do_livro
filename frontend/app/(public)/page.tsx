'use client';

import Link from 'next/link';
import {
  useVoteSessions,
  useRecommendations,
  useCalendar,
  useRankings,
  useRecentReviews,
} from '@/lib/hooks/useData';
import { MediaCard } from '@/components/MediaCard';
import { Calendar } from '@/components/Calendar';
import { Card } from '@/components/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HomePage() {
  const { data: sessions } = useVoteSessions('OPEN');
  const { data: recommendations } = useRecommendations();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const { data: calendarEvents } = useCalendar(start.toISOString(), end.toISOString());
  const { data: rankings } = useRankings();
  const { data: recentReviews } = useRecentReviews();

  const upcomingVote = sessions?.[0];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
          Bem-vindo ao Clube dos Filmes
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          Vote, assista, avalie e debata com seu grupo de filmes.
        </p>
      </section>

      {upcomingVote && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Próxima votação</h2>
          <Card className="border-primary-200 dark:border-primary-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{upcomingVote.title}</h3>
                <p className="text-sm text-stone-500">
                  {format(new Date(upcomingVote.startDate), "d 'de' MMM", { locale: ptBR })} até{' '}
                  {format(new Date(upcomingVote.endDate), "d 'de' MMM yyyy", { locale: ptBR })}
                </p>
              </div>
              <Link
                href={`/votes?session=${upcomingVote.id}`}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Participar da votação
              </Link>
            </div>
          </Card>
        </section>
      )}

      <section>
        <Calendar events={calendarEvents ?? []} />
      </section>

      {recommendations && recommendations.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Sugestões do clube</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {recommendations.slice(0, 10).map((m) => (
              <MediaCard key={m.id} media={m} />
            ))}
          </div>
        </section>
      )}

      {rankings && rankings.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Ranking do clube</h2>
          <Card>
            <ul className="divide-y divide-stone-200 dark:divide-stone-700">
              {rankings.slice(0, 10).map((u, i) => (
                <li key={u.id} className="flex items-center justify-between py-2">
                  <span className="text-stone-500">#{i + 1}</span>
                  <Link href={`/profile/${u.id}`} className="font-medium hover:underline">
                    {u.name}
                  </Link>
                  <span className="text-sm text-stone-500">{u.points} pts</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {recentReviews && recentReviews.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Avaliações recentes</h2>
          <ul className="space-y-3">
            {recentReviews.slice(0, 5).map((r: { id: string; rating: number; comment?: string | null; user?: { name: string }; media?: { title: string } }) => (
              <Card key={r.id}>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  <strong>{r.user?.name}</strong> deu {r.rating}/10
                  {r.media && ` em "${r.media.title}"`}
                </p>
                {r.comment && <p className="mt-1 text-sm italic">&quot;{r.comment}&quot;</p>}
              </Card>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
