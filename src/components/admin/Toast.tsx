'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Minimal toast system — a dependency-free replacement for the reference's
 * `sonner`. Provides a `useToast()` hook returning `{ success, error, info }`.
 * Toasts auto-dismiss after a few seconds and stack bottom-right.
 */

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const toneClasses: Record<ToastTone, string> = {
  success: 'border-olive/40 bg-olive text-ivory',
  error: 'border-wine/40 bg-wine text-ivory',
  info: 'border-stone bg-charcoal text-ivory',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, tone, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => remove(t.id)}
            className={cn(
              'pointer-events-auto fade-up rounded-md border px-4 py-3 text-left font-body text-sm shadow-[0_18px_40px_rgba(35,33,28,0.18)]',
              toneClasses[t.tone],
            )}
          >
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return ctx;
}
