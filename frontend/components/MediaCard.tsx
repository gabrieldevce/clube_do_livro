import Link from 'next/link';
import type { Media } from '@/lib/types';
import { Card } from './Card';

export function MediaCard({ media }: { media: Media }) {
  const href = `/media/${media.id}`;
  const isBook = media.type === 'BOOK';

  return (
    <Link href={href}>
      <Card className="overflow-hidden transition hover:shadow-md">
        <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-stone-200 dark:bg-stone-700">
          {media.coverUrl ? (
            <img
              src={media.coverUrl}
              alt={media.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-stone-400">
              {isBook ? '📚' : '🎬'}
            </div>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 font-semibold">{media.title}</h3>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
          {media.year && <span>{media.year}</span>}
          {media.authorOrDirector && (
            <span className="ml-1"> · {media.authorOrDirector}</span>
          )}
        </p>
        {media.genres?.length > 0 && (
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            {media.genres.slice(0, 3).join(', ')}
          </p>
        )}
      </Card>
    </Link>
  );
}
