'use client';

import { useMediaList } from '@/lib/hooks/useData';
import { MediaCard } from '@/components/MediaCard';
import { Card } from '@/components/Card';
import { useState } from 'react';

export default function AdminMediaPage() {
  const [type, setType] = useState<string>('');
  const { data: mediaList } = useMediaList(type ? { type } : undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar mídias</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Filmes e books do catálogo. Edição e aprovação via API.
      </p>
      <Card>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('')}
            className={`rounded px-3 py-1 text-sm ${!type ? 'bg-primary-600 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setType('MOVIE')}
            className={`rounded px-3 py-1 text-sm ${type === 'MOVIE' ? 'bg-primary-600 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}
          >
            Filmes
          </button>
          <button
            type="button"
            onClick={() => setType('BOOK')}
            className={`rounded px-3 py-1 text-sm ${type === 'BOOK' ? 'bg-primary-600 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}
          >
            Books
          </button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {mediaList?.map((m) => (
          <MediaCard key={m.id} media={m} />
        ))}
      </div>
      {(!mediaList || mediaList.length === 0) && (
        <p className="text-stone-500">Nenhuma mídia encontrada.</p>
      )}
    </div>
  );
}
