'use client';

import { useRankings } from '@/lib/hooks/useData';
import { Card } from '@/components/Card';
import Link from 'next/link';

export default function RankingPage() {
  const { data: rankings } = useRankings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ranking do clube</h1>
      <Card>
        {rankings && rankings.length > 0 ? (
          <ul className="divide-y divide-stone-200 dark:divide-stone-700">
            {rankings.map((u, i) => (
              <li key={u.id} className="flex items-center justify-between py-3">
                <span className="w-8 text-stone-500">#{i + 1}</span>
                <Link href={`/profile/${u.id}`} className="flex-1 font-medium hover:underline">
                  {u.name}
                </Link>
                <span className="text-stone-500">{u.points} pts</span>
                <span className="ml-2 text-sm text-stone-400">{u.level}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-500">Nenhum membro no ranking ainda.</p>
        )}
      </Card>
    </div>
  );
}
