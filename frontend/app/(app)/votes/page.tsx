'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useVoteSessions, useVoteSession } from '@/lib/hooks/useData';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Card } from '@/components/Card';
import { MediaCard } from '@/components/MediaCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function VotesContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const { data: sessions } = useVoteSessions();
  const { data: session } = useVoteSession(sessionId);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const token = getToken();

  const voteMutation = useMutation({
    mutationFn: (voteOptionId: string) =>
      api.post(`/votes/sessions/${session?.id}/vote`, { voteOptionId }, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vote', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Votações</h1>

      {sessionId && session ? (
        <Card>
          <h2 className="text-lg font-semibold">{session.title}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {format(new Date(session.startDate), "d 'de' MMM", { locale: ptBR })} –{' '}
            {format(new Date(session.endDate), "d 'de' MMM yyyy", { locale: ptBR })}
          </p>
          <p className="mt-1 text-sm text-stone-500">Status: {session.status}</p>

          {session.status === 'OPEN' && isAuthenticated ? (
            <div className="mt-6">
              <p className="mb-3 font-medium">Escolha uma opção:</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {session.options?.map((opt) => (
                  <div key={opt.id} className="rounded-lg border border-stone-200 p-3 dark:border-stone-700">
                    {opt.media && <MediaCard media={opt.media} />}
                    <p className="mt-2 text-sm text-stone-500">{opt.voteCount} votos</p>
                    <button
                      type="button"
                      onClick={() => voteMutation.mutate(opt.id)}
                      disabled={voteMutation.isPending}
                      className="mt-2 w-full rounded-md bg-primary-600 py-1.5 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      Votar
                    </button>
                  </div>
                ))}
              </div>
              {voteMutation.isError && (
                <p className="mt-2 text-sm text-red-600">{(voteMutation.error as Error).message}</p>
              )}
            </div>
          ) : session.status === 'CLOSED' && session.winnerMedia ? (
            <div className="mt-6">
              <p className="mb-2 font-medium">Vencedor:</p>
              <MediaCard media={session.winnerMedia} />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {session.options?.map((opt) => (
                <div key={opt.id}>
                  {opt.media && <MediaCard media={opt.media} />}
                  <p className="mt-1 text-sm text-stone-500">{opt.voteCount} votos</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <>
          <p className="text-stone-600 dark:text-stone-400">
            Escolha uma sessão de votação abaixo ou aguarde uma nova abertura.
          </p>
          <ul className="space-y-3">
            {sessions?.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/votes?session=${s.id}`}
                  className="block rounded-lg border border-stone-200 p-4 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800/50"
                >
                  <span className="font-medium">{s.title}</span>
                  <span className="ml-2 text-sm text-stone-500">
                    {format(new Date(s.endDate), "d MMM yyyy", { locale: ptBR })} · {s.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {(!sessions || sessions.length === 0) && (
            <p className="text-stone-500">Nenhuma votação no momento.</p>
          )}
        </>
      )}
    </div>
  );
}

export default function VotesPage() {
  return (
    <Suspense fallback={<div className="space-y-8"><h1 className="text-2xl font-bold">Votações</h1><p className="text-stone-500">Carregando...</p></div>}>
      <VotesContent />
    </Suspense>
  );
}
