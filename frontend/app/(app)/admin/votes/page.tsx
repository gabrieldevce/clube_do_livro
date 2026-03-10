'use client';

import { useVoteSessions } from '@/lib/hooks/useData';
import { Card } from '@/components/Card';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminVotesPage() {
  const { data: sessions } = useVoteSessions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar votações</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Crie novas sessões de votação em Admin ou via API. Aqui você visualiza as existentes.
      </p>
      <Card>
        {sessions && sessions.length > 0 ? (
          <ul className="divide-y divide-stone-200 dark:divide-stone-700">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-stone-500">
                    {format(new Date(s.startDate), "d MMM yyyy", { locale: ptBR })} –{' '}
                    {format(new Date(s.endDate), "d MMM yyyy", { locale: ptBR })} · {s.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500">Nenhuma sessão de votação cadastrada.</p>
        )}
      </Card>
    </div>
  );
}
