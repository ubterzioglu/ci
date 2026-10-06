'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Accordion-style surface: a clickable header toggles the body. Used to keep
 * entry forms collapsible above their content lists (e.g. "Yeni revizyon
 * isteği"). Uncontrolled — the user can open/close freely.
 */

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    className={cn('text-muted shrink-0 transition-transform', open && 'rotate-180')}
  >
    <path
      d="M5 7.5l5 5 5-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface AdminCollapsibleProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AdminCollapsible({
  title,
  description,
  defaultOpen = false,
  children,
  className,
  contentClassName,
}: AdminCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        'border-stone bg-marble overflow-hidden rounded-lg border shadow-[0_18px_50px_rgba(35,33,28,0.06)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="hover:bg-cream-deep/50 flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors sm:px-5"
      >
        <div className="min-w-0">
          <h2 className="font-display text-charcoal text-lg">{title}</h2>
          {description && (
            <p className="font-body text-muted mt-0.5 text-sm leading-5">{description}</p>
          )}
        </div>
        <Chevron open={open} />
      </button>
      {open && (
        <div className={cn('border-stone/70 border-t px-4 py-4 sm:px-5', contentClassName)}>
          {children}
        </div>
      )}
    </section>
  );
}
