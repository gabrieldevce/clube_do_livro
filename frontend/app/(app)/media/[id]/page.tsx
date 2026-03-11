'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMedia, useReviews, useDebateRoom } from '@/lib/hooks/useData';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Card } from '@/components/Card';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export default function MediaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: media, isLoading } = useMedia(id);
  const { data: reviews } = useReviews(id);
  const { data: debateRoom } = useDebateRoom(id);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const token = getToken();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [completed, setCompleted] = useState(false);

  const submitReviewMutation = useMutation({
    mutationFn: (body: { rating: number; comment?: string; completed: boolean }) =>
      api.post(`/media/${id}/reviews`, body, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    },
  });

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    submitReviewMutation.mutate({ rating, comment: comment || undefined, completed });
  }

  if (isLoading || !media) {
    return <p className="text-stone-500">Carregando...</p>;
  }

  const isBook = media.type === 'BOOK';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-shrink-0">
          <div className="aspect-[2/3] w-48 overflow-hidden rounded-lg bg-stone-200 dark:bg-stone-700">
            {media.coverUrl ? (
              <img src={media.coverUrl} alt={media.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">
                {isBook ? '📚' : '🎬'}
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{media.title}</h1>
          {media.year && <p className="text-stone-500">{media.year}</p>}
          {media.authorOrDirector && (
            <p className="mt-1">
              <span className="text-stone-500">{isBook ? 'Autor' : 'Diretor'}:</span>{' '}
              {media.authorOrDirector}
            </p>
          )}
          {media.genres?.length > 0 && (
            <p className="mt-1 text-sm text-stone-500">
              Gêneros: {media.genres.join(', ')}
            </p>
          )}
          {media.runtimeOrPages && (
            <p className="mt-1 text-sm text-stone-500">
              {isBook ? 'Páginas' : 'Duração'}: {media.runtimeOrPages}
              {isBook ? '' : ' min'}
            </p>
          )}
          {(media as { averageRating?: number }).averageRating != null && (
            <p className="mt-2 font-medium">
              Média do clube: {(media as { averageRating: number }).averageRating.toFixed(1)}/10
            </p>
          )}
          {media.description && (
            <p className="mt-3 text-stone-600 dark:text-stone-400">{media.description}</p>
          )}
          {debateRoom && (
            <Link
              href={`/debate/${debateRoom.id}`}
              className="mt-4 inline-block rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
            >
              Entrar no debate
            </Link>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <Card>
          <h2 className="text-lg font-semibold">Sua avaliação</h2>
          <form onSubmit={handleSubmitReview} className="mt-3 space-y-3">
            <div>
              <label className="block text-sm text-stone-600 dark:text-stone-400">
                Nota (0–10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="mt-1 w-20 rounded border border-stone-300 px-2 py-1 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-600 dark:text-stone-400">
                Comentário (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-800"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              <span className="text-sm">Já assisti</span>
            </label>
            <button
              type="submit"
              disabled={submitReviewMutation.isPending}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submitReviewMutation.isPending ? 'Enviando...' : 'Enviar avaliação'}
            </button>
            {submitReviewMutation.isError && (
              <p className="text-sm text-red-600">{(submitReviewMutation.error as Error).message}</p>
            )}
          </form>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Avaliações do clube</h2>
        {reviews && reviews.length > 0 ? (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{r.user?.name ?? 'Usuário'}</span>
                  <span>{r.rating}/10 · {format(new Date(r.createdAt), "d MMM yyyy", { locale: ptBR })}</span>
                </div>
                {r.comment && <p className="mt-1 text-stone-600 dark:text-stone-400">{r.comment}</p>}
              </Card>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500">Nenhuma avaliação ainda.</p>
        )}
      </section>
    </div>
  );
}
