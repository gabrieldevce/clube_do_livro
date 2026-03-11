'use client';

import Link from 'next/link';
import { useMyGroups, usePendingInvites } from '@/lib/hooks/useData';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Card } from '@/components/Card';
import { useState } from 'react';
import { setFlashMessage } from '@/lib/flash';

export default function GroupsPage() {
  const { isAuthenticated } = useAuth();
  const { data: groups, isLoading } = useMyGroups();
  const { data: pendingInvites } = usePendingInvites();
  const queryClient = useQueryClient();
  const token = getToken();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      api.post<{ id: string }>('/groups', body, token ?? undefined),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setName('');
      setDescription('');
      setFlashMessage({ type: 'success', text: 'Grupo criado com sucesso.' });
      if (data && 'id' in data) window.location.href = `/groups/${data.id}`;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (inviteId: string) =>
      api.post<{ groupId: string }>(`/groups/invites/${inviteId}/accept`, {}, token ?? undefined),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setFlashMessage({ type: 'success', text: 'Você entrou no grupo com sucesso.' });
      if (data?.groupId) window.location.href = `/groups/${data.groupId}`;
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (inviteId: string) =>
      api.post(`/groups/invites/${inviteId}/reject`, {}, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      setFlashMessage({ type: 'success', text: 'Convite recusado.' });
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() || undefined });
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Grupos</h1>
        <p className="text-stone-500">Faça login para ver e criar grupos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Meus grupos</h1>

      {pendingInvites && pendingInvites.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Convites pendentes</h2>
          <ul className="space-y-2">
            {pendingInvites.map((inv: { id: string; groupName: string; invitedByName: string }) => (
              <li key={inv.id} className="flex items-center justify-between rounded border border-stone-200 p-2 dark:border-stone-700">
                <span>
                  <strong>{inv.groupName}</strong> — convite de {inv.invitedByName}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => acceptMutation.mutate(inv.id)}
                    disabled={acceptMutation.isPending}
                    className="rounded bg-primary-600 px-2 py-1 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectMutation.mutate(inv.id)}
                    disabled={rejectMutation.isPending}
                    className="rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-600"
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Criar grupo</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400">Nome do grupo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Clube dos Filmes"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm text-stone-600 dark:text-stone-400">Descrição (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || createMutation.isPending}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Criando...' : 'Criar grupo'}
          </button>
          {createMutation.isError && (
            <p className="text-sm text-red-600">{(createMutation.error as Error).message}</p>
          )}
        </form>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Grupos que participo</h2>
        {isLoading ? (
          <p className="text-stone-500">Carregando...</p>
        ) : groups && groups.length > 0 ? (
          <ul className="space-y-3">
            {groups.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/groups/${g.id}`}
                  className="block rounded-lg border border-stone-200 p-4 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800/50"
                >
                  <span className="font-medium">{g.name}</span>
                  <span className="ml-2 text-sm text-stone-500">
                    {g.memberCount} membro(s) · {g.role}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500">Você ainda não participa de nenhum grupo. Crie um acima ou aceite um convite.</p>
        )}
      </section>
    </div>
  );
}
