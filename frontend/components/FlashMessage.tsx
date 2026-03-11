'use client';

import { useEffect, useState } from 'react';
import { FlashMessageState, subscribeFlash, setFlashMessage } from '@/lib/flash';

export function FlashMessage() {
  const [message, setMessage] = useState<FlashMessageState | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeFlash((msg) => {
      setMessage(msg);
      if (msg) {
        const id = setTimeout(() => setFlashMessage(null), 4000);
        return () => clearTimeout(id);
      }
      return;
    });
    return unsubscribe;
  }, []);

  if (!message) return null;

  const base =
    'fixed z-50 left-1/2 top-4 -translate-x-1/2 rounded-md px-4 py-2 text-sm shadow-lg border';
  const color =
    message.type === 'success'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-900/40 dark:border-emerald-500 dark:text-emerald-100'
      : 'bg-red-50 border-red-300 text-red-900 dark:bg-red-900/40 dark:border-red-500 dark:text-red-100';

  return (
    <div className={`${base} ${color}`}>
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {message.type === 'success' ? 'Sucesso' : 'Erro'}
        </span>
        <span className="text-stone-700 dark:text-stone-100">{message.text}</span>
        <button
          type="button"
          onClick={() => setFlashMessage(null)}
          className="ml-3 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-300 dark:hover:text-stone-100"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

