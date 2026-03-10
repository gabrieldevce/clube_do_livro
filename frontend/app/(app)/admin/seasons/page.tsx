'use client';

import { useSeasons } from '@/lib/hooks/useData';
import { Card } from '@/components/Card';

export default function AdminSeasonsPage() {
  const { data: seasons } = useSeasons();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Temporadas</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Fases do clube (ex.: Temporada 1 – Ficção científica). Criação/edição via API.
      </p>
      <Card>
        {seasons && seasons.length > 0 ? (
          <ul className="divide-y divide-stone-200 dark:divide-stone-700">
            {seasons.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <span className="font-medium">{s.name}</span>
                {s.isActive && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/50 dark:text-green-200">
                    Ativa
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500">Nenhuma temporada cadastrada.</p>
        )}
      </Card>
    </div>
  );
}
