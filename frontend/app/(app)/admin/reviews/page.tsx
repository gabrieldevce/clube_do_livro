'use client';

import { Card } from '@/components/Card';

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Moderar avaliações</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Listagem e exclusão de avaliações via API <code className="rounded bg-stone-200 px-1 dark:bg-stone-700">DELETE /admin/reviews/:id</code>.
      </p>
      <Card>
        <p className="text-stone-500">
          Acesse uma mídia em &quot;Mídias&quot; e visualize as avaliações na página pública da mídia. 
          A exclusão pode ser feita por integração com o backend.
        </p>
      </Card>
    </div>
  );
}
