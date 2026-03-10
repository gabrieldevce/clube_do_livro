'use client';

import { useState } from 'react';
import { useCalendar } from '@/lib/hooks/useData';
import { Calendar } from '@/components/Calendar';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const { data: events } = useCalendar(start.toISOString(), end.toISOString());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendário</h1>
      <p className="text-stone-600 dark:text-stone-400">
        Reuniões, prazos de votação e eventos temáticos do clube.
      </p>
      <Calendar events={events ?? []} />
    </div>
  );
}
