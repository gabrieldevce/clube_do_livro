'use client';

import { useGenreVotes } from '@/lib/hooks/useData';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Card } from '@/components/Card';
import { useState } from 'react';
import { setFlashMessage } from '@/lib/flash';

const COMMON_GENRES = [
  'Ficção científica', 'Terror', 'Romance', 'Drama', 'Comédia',
  'Ação', 'Fantasia', 'Suspense', 'Documentário', 'Literatura clássica',
];

export default function GenresPage() {
  const { data: genreVotes } = useGenreVotes();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const token = getToken();
  const [selected, setSelected] = useState<string[]>([]);

  const submitMutation = useMutation({
    mutationFn: (genres: string[]) =>
      api.post('/genres/votes', { genres }, token ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      setSelected([]);
      setFlashMessage({ type: 'success', text: 'Votos de gêneros enviados com sucesso.' });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) return;
    submitMutation.mutate(selected);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Votação de gêneros</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Escolha seu gênero da semana. Suas escolhas influenciam as sugestões do clube.
      </p>

      {genreVotes && genreVotes.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Ranking da semana</h2>
          <ul className="space-y-1">
            {genreVotes.map((g, i) => (
              <li key={g.genre} className="flex justify-between text-sm">
                <span>#{i + 1} {g.genre}</span>
                <span className="text-stone-500">{g.totalVotes} votos</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {isAuthenticated ? (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Escolha seu gênero da semana</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-2">
              {COMMON_GENRES.map((genre) => (
                <label key={genre} className="flex cursor-pointer items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selected.includes(genre)}
                    onChange={(e) =>
                      setSelected((s) =>
                        e.target.checked ? [...s, genre] : s.filter((x) => x !== genre)
                      )
                    }
                    className="rounded border-stone-300"
                  />
                  <span className="text-sm">{genre}</span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={selected.length === 0 || submitMutation.isPending}
              className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Enviando...' : 'Enviar votos'}
            </button>
            {submitMutation.isError && (
              <p className="mt-2 text-sm text-red-600">{(submitMutation.error as Error).message}</p>
            )}
          </form>
        </Card>
      ) : (
        <p className="text-stone-500">Faça login para votar nos gêneros.</p>
      )}
    </div>
  );
}
