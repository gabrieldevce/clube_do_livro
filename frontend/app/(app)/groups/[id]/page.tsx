'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGroup, useVoteSessions } from '@/lib/hooks/useData';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Card } from '@/components/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { setFlashMessage } from '@/lib/flash';

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Líder',
  ADMIN: 'Co-líder',
  MEMBER: 'Membro',
};

export default function GroupDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: group, isLoading } = useGroup(id);
  const { data: sessions } = useVoteSessions(undefined, id);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const token = getToken();
  const [inviteEmail, setInviteEmail] = useState('');
  const isAdmin = group?.myRole === 'OWNER' || group?.myRole === 'ADMIN';

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/groups/${id}`, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setFlashMessage({ type: 'success', text: 'Grupo excluído com sucesso.' });
      window.location.href = '/groups';
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.post(`/groups/${id}/leave`, {}, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setFlashMessage({ type: 'success', text: 'Você saiu do grupo.' });
      window.location.href = '/groups';
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) => api.post(`/groups/${id}/invites`, { email }, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      setInviteEmail('');
      setFlashMessage({ type: 'success', text: 'Convite enviado com sucesso.' });
    },
  });

  if (isLoading || !group) {
    return <p className="text-stone-500">Carregando...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="mt-1 text-stone-600 dark:text-stone-400">{group.description}</p>
          )}
          <p className="mt-1 text-sm text-stone-500">
            {group.memberCount} membro(s) · Você: {ROLE_LABEL[group.myRole ?? 'MEMBER'] ?? group.myRole}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Link
              href={`/groups/${id}/admin`}
              className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
            >
              Painel do líder
            </Link>
          )}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.')) {
                  deleteMutation.mutate();
                }
              }}
              className="rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Excluir grupo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (confirm('Tem certeza que deseja sair deste grupo?')) {
                  leaveMutation.mutate();
                }
              }}
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-100 dark:hover:bg-stone-800"
            >
              Sair do grupo
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Convidar por e-mail</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inviteEmail.trim()) inviteMutation.mutate(inviteEmail.trim());
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="flex-1 rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
            <button
              type="submit"
              disabled={!inviteEmail.trim() || inviteMutation.isPending}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Enviar convite
            </button>
          </form>
          {inviteMutation.isError && (
            <p className="mt-2 text-sm text-red-600">{(inviteMutation.error as Error).message}</p>
          )}
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Membros</h2>
        <ul className="space-y-2">
          {group.members?.map((m) => (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
                  {(m.user?.name ?? m.userId).charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{m.user?.name ?? m.userId}</span>
              </div>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                {ROLE_LABEL[m.role] ?? m.role}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Votações deste grupo</h2>
        {sessions && sessions.length > 0 ? (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/votes?session=${s.id}`}
                  className="block rounded-lg border border-stone-200 p-4 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800/50"
                >
                  <span className="font-medium">{s.title}</span>
                  <span className="ml-2 text-sm text-stone-500">
                    {format(new Date(s.endDate), 'd MMM yyyy', { locale: ptBR })} · {s.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500">Nenhuma votação ainda. {isAdmin && 'Use "Configurar votação" para criar uma.'}</p>
        )}
      </section>
    </div>
  );
}
