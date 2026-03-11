'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGroup, useVoteSessions, useMediaList, useExternalMovieSearch } from '@/lib/hooks/useData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Card } from '@/components/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { setFlashMessage } from '@/lib/flash';

export default function GroupAdminPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: group, isLoading } = useGroup(id);
  const { data: sessions } = useVoteSessions(undefined, id);
  const { data: mediaList } = useMediaList({ type: 'MOVIE' });
  const queryClient = useQueryClient();
  const token = getToken();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [omdbQuery, setOmdbQuery] = useState('');
  const { data: externalMovies } = useExternalMovieSearch(omdbQuery.trim());

  const createSessionMutation = useMutation({
    mutationFn: (body: { title: string; startDate: string; endDate: string }) =>
      api.post(`/groups/${id}/vote-sessions`, body, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      setTitle('');
      setStartDate('');
      setEndDate('');
      setFlashMessage({ type: 'success', text: 'Votação criada com sucesso.' });
    },
  });

  const addOptionMutation = useMutation({
    mutationFn: ({ sessionId, mediaId }: { sessionId: string; mediaId: string }) =>
      api.post(`/groups/${id}/vote-sessions/${sessionId}/options`, { mediaId }, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      setSelectedMediaId('');
      setFlashMessage({ type: 'success', text: 'Filme adicionado à votação.' });
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      api.patch(`/groups/${id}/vote-sessions/${sessionId}/close`, {}, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      setFlashMessage({ type: 'success', text: 'Votação encerrada com sucesso.' });
    },
  });

  const openSessions = sessions?.filter((s) => s.status === 'OPEN') ?? [];

  if (isLoading || !group) {
    return <p className="text-stone-500">Carregando...</p>;
  }

  const isAdmin = group.myRole === 'OWNER' || group.myRole === 'ADMIN';
  if (!isAdmin) {
    return (
      <div>
        <p className="text-stone-500">Acesso negado. Apenas administradores do grupo podem configurar votações.</p>
        <Link href={`/groups/${id}`} className="mt-4 inline-block text-primary-600 hover:underline">
          Voltar ao grupo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/groups/${id}`} className="text-sm text-stone-500 hover:underline">
          ← Voltar ao grupo
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Configurar votação — {group.name}</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Crie sessões de votação e adicione filmes para os membros votarem. Valide os filmes antes de abrir a votação.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Criar nova votação</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim() && startDate && endDate)
              createSessionMutation.mutate({ title: title.trim(), startDate, endDate });
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Filme da semana 1"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-stone-600 dark:text-stone-400">Início</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-600 dark:text-stone-400">Fim</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!title.trim() || !startDate || !endDate || createSessionMutation.isPending}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {createSessionMutation.isPending ? 'Criando...' : 'Criar votação'}
          </button>
          {createSessionMutation.isError && (
            <p className="text-sm text-red-600">{(createSessionMutation.error as Error).message}</p>
          )}
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Votação de gêneros do grupo</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Controle se os membros podem votar nos gêneros preferidos deste grupo.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm">
            Status atual:{' '}
            <span
              className={
                group.genreVotingOpen ? 'font-semibold text-emerald-600' : 'font-semibold text-stone-500'
              }
            >
              {group.genreVotingOpen ? 'Aberta' : 'Fechada'}
            </span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={group.genreVotingOpen}
              onClick={async () => {
                await api.post(`/groups/${id}/genre-voting`, { open: true }, token ?? undefined);
                queryClient.invalidateQueries({ queryKey: ['group', id] });
                setFlashMessage({ type: 'success', text: 'Votação de gêneros aberta para este grupo.' });
              }}
              className="rounded-md border border-emerald-600 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-400 dark:text-emerald-100 dark:hover:bg-emerald-900/30"
            >
              Abrir votação
            </button>
            <button
              type="button"
              disabled={!group.genreVotingOpen}
              onClick={async () => {
                await api.post(`/groups/${id}/genre-voting`, { open: false }, token ?? undefined);
                queryClient.invalidateQueries({ queryKey: ['group', id] });
                setFlashMessage({ type: 'success', text: 'Votação de gêneros fechada para este grupo.' });
              }}
              className="rounded-md border border-stone-400 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-500 dark:text-stone-100 dark:hover:bg-stone-800"
            >
              Fechar votação
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Adicionar filme a uma votação aberta</h2>
        <p className="mb-3 text-sm text-stone-500">
          Selecione uma votação e um filme do catálogo para incluir como opção. Apenas votações com status OPEN aceitam novos filmes.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400">Votação</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            >
              <option value="">Selecione</option>
              {openSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} (até {format(new Date(s.endDate), 'd MMM', { locale: ptBR })})
                </option>
              ))}
              {openSessions.length === 0 && <option disabled>Nenhuma votação aberta</option>}
            </select>
          </div>
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400">Filme (catálogo)</label>
            <select
              value={selectedMediaId}
              onChange={(e) => setSelectedMediaId(e.target.value)}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            >
              <option value="">Selecione</option>
              {mediaList?.slice(0, 100).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} {m.year ? `(${m.year})` : ''}{m.authorOrDirector ? ` – ${m.authorOrDirector}` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={!selectedSessionId || !selectedMediaId || addOptionMutation.isPending}
            onClick={() =>
              selectedSessionId &&
              selectedMediaId &&
              addOptionMutation.mutate({ sessionId: selectedSessionId, mediaId: selectedMediaId })
            }
            className="rounded-md bg-accent-600 px-4 py-2 text-sm text-white hover:bg-accent-700 disabled:opacity-50"
          >
            {addOptionMutation.isPending ? 'Adicionando...' : 'Adicionar filme à votação'}
          </button>
          {addOptionMutation.isError && (
            <p className="text-sm text-red-600">{(addOptionMutation.error as Error).message}</p>
          )}
          {selectedMediaId && mediaList && (
            <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-700">
              <p className="mb-2 text-sm font-medium text-stone-600 dark:text-stone-300">
                Pré-visualização do filme selecionado
              </p>
              {mediaList
                .filter((m) => m.id === selectedMediaId)
                .map((m) => (
                  <div key={m.id} className="space-y-1 text-sm">
                    <p className="font-semibold">
                      {m.title} {m.year ? `(${m.year})` : ''}
                    </p>
                    {m.description && (
                      <p className="line-clamp-3 text-stone-600 dark:text-stone-400">
                        {m.description}
                      </p>
                    )}
                    <Link
                      href={`/media/${m.id}`}
                      target="_blank"
                      className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                    >
                      Ver sinopse completa
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Buscar filmes na OMDb</h2>
        <p className="mb-3 text-sm text-stone-500">
          Pesquise filmes diretamente na OMDb e adicione-os à votação selecionada. Isso salva o filme no catálogo e já
          o vincula à votação.
        </p>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-stone-600 dark:text-stone-400">Votação aberta</label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              >
                <option value="">Selecione</option>
                {openSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} (até {format(new Date(s.endDate), 'd MMM', { locale: ptBR })})
                  </option>
                ))}
                {openSessions.length === 0 && <option disabled>Nenhuma votação aberta</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm text-stone-600 dark:text-stone-400">Buscar filme (OMDb)</label>
              <input
                type="text"
                value={omdbQuery}
                onChange={(e) => setOmdbQuery(e.target.value)}
                placeholder="Digite pelo menos 3 letras do título"
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
          </div>
          {!externalMovies && omdbQuery.trim().length >= 3 && (
            <p className="text-sm text-stone-500">Buscando filmes na OMDb...</p>
          )}
          {externalMovies && externalMovies.length === 0 && omdbQuery.trim().length >= 3 && (
            <p className="text-sm text-stone-500">Nenhum filme encontrado para essa busca.</p>
          )}
          {externalMovies && externalMovies.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {externalMovies.map((m) => (
                <div
                  key={m.imdbId}
                  className="flex flex-col gap-2 rounded border border-stone-200 p-3 dark:border-stone-700"
                >
                  <div className="flex gap-3">
                    <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-stone-200 dark:bg-stone-700">
                      {m.poster ? (
                        <img src={m.poster} alt={m.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">🎬</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {m.title} {m.year ? `(${m.year})` : ''}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Fonte: OMDb
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedSessionId || addOptionMutation.isPending}
                    onClick={async () => {
                      if (!selectedSessionId) return;
                      try {
                        const created = await api.post<import('@/lib/types').Media>(
                          '/media/from-omdb',
                          { imdbId: m.imdbId },
                          token ?? undefined,
                        );
                        await addOptionMutation.mutateAsync({
                          sessionId: selectedSessionId,
                          mediaId: created.id,
                        });
                      } catch (err) {
                        setFlashMessage({
                          type: 'error',
                          text: (err as Error).message ?? 'Erro ao adicionar filme da OMDb',
                        });
                      }
                    }}
                    className="mt-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    Adicionar à votação
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {sessions && sessions.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Votações do grupo</h2>
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-stone-200 p-2 dark:border-stone-700"
              >
                <div>
                  <span className="font-medium">{s.title}</span>
                  <span className="ml-2 text-sm text-stone-500">
                    {format(new Date(s.startDate), 'd MMM', { locale: ptBR })} –{' '}
                    {format(new Date(s.endDate), 'd MMM yyyy', { locale: ptBR })} · {s.status}
                  </span>
                </div>
                {s.status === 'OPEN' && (
                  <button
                    type="button"
                    onClick={() => closeSessionMutation.mutate(s.id)}
                    disabled={closeSessionMutation.isPending}
                    className="rounded border border-amber-600 px-2 py-1 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    Encerrar votação
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
