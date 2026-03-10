'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ClubMeeting } from '@/lib/types';
import { Card } from './Card';

const EVENT_LABELS: Record<string, string> = {
  MEETING: 'Reunião',
  VOTE_DEADLINE: 'Prazo votação',
  SEASONAL_EVENT: 'Evento temático',
};

export function Calendar({ events = [] }: { events?: ClubMeeting[] }) {
  const [month, setMonth] = useState(new Date());
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const firstDayOfWeek = start.getDay();

  const getEventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), date));

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-stone-700">
        <h2 className="text-lg font-semibold">Calendário do clube</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            ←
          </button>
          <span className="min-w-[140px] text-center font-medium">
            {format(month, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded p-1 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            →
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-sm">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="font-medium text-stone-500 dark:text-stone-400">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className="min-h-[60px] rounded border border-stone-100 p-1 dark:border-stone-800"
            >
              <span className={!isSameMonth(day, month) ? 'text-stone-300 dark:text-stone-600' : ''}>
                {format(day, 'd')}
              </span>
              {dayEvents.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className="mt-0.5 truncate rounded bg-primary-100 px-0.5 text-xs text-primary-800 dark:bg-primary-900/50 dark:text-primary-200"
                  title={ev.title}
                >
                  {EVENT_LABELS[ev.type] || ev.type}: {ev.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-stone-500">+{dayEvents.length - 2}</div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
