'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Promise-based confirmation dialog — replaces the browser's window.confirm
 * with a panel-styled modal. Returns `{ confirm, dialog }`: render `dialog`
 * once in the component tree, and `await confirm({...})` resolves to a boolean.
 */

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface PendingState extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

export function useConfirm() {
  const [pending, setPending] = useState<PendingState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const settle = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending],
  );

  const dialog = pending ? (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        onClick={() => settle(false)}
        className="bg-charcoal/40 absolute inset-0 backdrop-blur-sm"
      />
      <div className="fade-up border-stone bg-marble relative w-full max-w-md rounded-lg border p-6 shadow-[0_28px_70px_rgba(35,33,28,0.22)]">
        <h2 className="font-display text-charcoal text-2xl">{pending.title}</h2>
        {pending.description && (
          <p className="font-body text-muted mt-2 text-sm leading-6">{pending.description}</p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => settle(false)}
            className="border-stone font-body text-charcoal hover:bg-cream-deep inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            {pending.cancelLabel ?? 'Vazgeç'}
          </button>
          <button
            type="button"
            onClick={() => settle(true)}
            className={cn(
              'font-body text-ivory inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
              pending.destructive ? 'bg-wine hover:bg-wine/90' : 'bg-olive hover:bg-olive-deep',
            )}
          >
            {pending.confirmLabel ?? 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}
