'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGroup, useVoteSessions, useMediaList } from '@/lib/hooks/useData';
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
