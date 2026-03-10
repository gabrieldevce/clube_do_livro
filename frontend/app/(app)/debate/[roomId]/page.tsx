'use client';

import { useParams } from 'next/navigation';
import { useDebateComments } from '@/lib/hooks/useData';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Card } from '@/components/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export default function DebatePage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { data: comments, isLoading } = useDebateComments(roomId);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const token = getToken();
  const [content, setContent] = useState('');

  const postMutation = useMutation({
    mutationFn: (body: { content: string }) =>
      api.post(`/debate/rooms/${roomId}/comments`, body, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debate', 'comments', roomId] });
      setContent('');
    },
  });

  const likeMutation = useMutation({
    mutationFn: (commentId: string) =>
      api.post(`/debate/comments/${commentId}/like`, {}, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debate', 'comments', roomId] });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    postMutation.mutate({ content: content.trim() });
  }

  if (isLoading) return <p className="text-stone-500">Carregando debate...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sala de debate</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Comentários ordenados por mais curtidas. Participe da discussão!
      </p>

      {isAuthenticated ? (
        <Card>
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva seu comentário..."
              rows={3}
              className="w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
            />
            <button
              type="submit"
              disabled={postMutation.isPending || !content.trim()}
              className="mt-2 rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {postMutation.isPending ? 'Enviando...' : 'Comentar'}
            </button>
          </form>
        </Card>
      ) : (
        <p className="text-stone-500">Faça login para comentar.</p>
      )}

      <ul className="space-y-3">
        {comments?.map((c: { id: string; content: string; createdAt: string; user?: { name: string }; _count?: { reactions: number }; userLiked?: boolean }) => (
          <Card key={c.id}>
            <div className="flex justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.user?.name ?? 'Anônimo'}</p>
                <p className="mt-1 text-stone-600 dark:text-stone-400">{c.content}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {format(new Date(c.createdAt), "d MMM yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500">{c._count?.reactions ?? 0} curtidas</span>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => likeMutation.mutate(c.id)}
                    className={`rounded px-2 py-1 text-sm ${c.userLiked ? 'bg-primary-200 dark:bg-primary-800' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                  >
                    {c.userLiked ? 'Curtido' : 'Curtir'}
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </ul>
      {(!comments || comments.length === 0) && (
        <p className="text-stone-500">Nenhum comentário ainda. Seja o primeiro!</p>
      )}
    </div>
  );
}
