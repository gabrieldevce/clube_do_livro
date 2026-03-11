export type FlashType = 'success' | 'error';

export interface FlashMessageState {
  type: FlashType;
  text: string;
}

// Simples store em módulo para compartilhamento via contexto
let currentFlash: FlashMessageState | null = null;
let listeners: ((msg: FlashMessageState | null) => void)[] = [];

export function subscribeFlash(listener: (msg: FlashMessageState | null) => void) {
  listeners.push(listener);
  listener(currentFlash);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function setFlashMessage(message: FlashMessageState | null) {
  currentFlash = message;
  for (const listener of listeners) listener(currentFlash);
}

