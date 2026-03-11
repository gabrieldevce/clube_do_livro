'use client';

import { useParams } from 'next/navigation';
import { useUser } from '@/lib/hooks/useData';
import { Card } from '@/components/Card';

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading } = useUser(id);

  if (isLoading || !user) {
    return <p className="text-stone-500">Carregando...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-200 text-2xl font-bold text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {user.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-stone-500">{user.points} pontos · Nível {user.level}</p>
        </div>
      </div>

      {user.userBadges && user.userBadges.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold">Distintivos</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.userBadges.map((ub: { badge: { name: string; description: string } }) => (
              <span
                key={ub.badge.name}
                className="rounded-full bg-primary-100 px-3 py-1 text-sm dark:bg-primary-900/50"
                title={ub.badge.description}
              >
                {ub.badge.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold">Sobre</h2>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Membro do Clube dos Filmes. Participe de votações, avaliações e debates para subir no ranking.
        </p>
      </Card>
    </div>
  );
}
