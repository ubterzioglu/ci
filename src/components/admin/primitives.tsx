import type React from 'react';
import { cn } from '@/lib/utils';

/**
 * Editorial admin primitives — the Ci Neo Cucina marble/olive counterparts of a
 * dashboard's surfaces and cards. Server-component friendly (no client hooks);
 * interactive pieces (Toast, ConfirmDialog, Collapsible) live in their own
 * 'use client' files.
 */

/* --- Surface: the standard bordered card with optional header ------------- */

interface AdminSurfaceProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AdminSurface({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: AdminSurfaceProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-stone bg-marble shadow-[0_18px_50px_rgba(35,33,28,0.06)]',
        className,
      )}
    >
      {(title || description || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone/70 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-lg text-charcoal">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 font-body text-sm leading-5 text-muted">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('px-4 py-4 sm:px-5', contentClassName)}>{children}</div>
    </section>
  );
}

/* --- Page header inside the main column ----------------------------------- */

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone bg-marble px-5 py-4 shadow-[0_18px_50px_rgba(35,33,28,0.06)] sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
          <h1 className="font-display text-2xl leading-tight text-charcoal sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl font-body text-sm leading-5 text-muted">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}

/* --- Stat card (live counts / filter buttons) ----------------------------- */

type StatTone = 'olive' | 'terracotta' | 'neutral' | 'wine';

const statToneClasses: Record<StatTone, string> = {
  olive: 'bg-olive text-ivory',
  terracotta: 'bg-terracotta text-ivory',
  wine: 'bg-wine text-ivory',
  neutral: 'bg-cream-deep text-muted',
};

interface AdminStatCardProps {
  label: string;
  value: React.ReactNode;
  detail?: string;
  tone?: StatTone;
}

export function AdminStatCard({ label, value, detail, tone = 'olive' }: AdminStatCardProps) {
  return (
    <div className="rounded-lg border border-stone bg-marble p-4 shadow-[0_12px_34px_rgba(35,33,28,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {label}
          </div>
          <div className="mt-3 font-display text-3xl leading-none text-charcoal">{value}</div>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 font-body text-[11px] font-medium',
            statToneClasses[tone],
          )}
        >
          canlı
        </span>
      </div>
      {detail && <div className="mt-3 font-body text-sm text-muted">{detail}</div>}
    </div>
  );
}

/* --- Status pill ----------------------------------------------------------- */

type PillTone = 'olive' | 'terracotta' | 'wine' | 'neutral' | 'charcoal';

const pillToneClasses: Record<PillTone, string> = {
  olive: 'bg-olive/12 text-olive-deep',
  terracotta: 'bg-terracotta/12 text-terracotta',
  wine: 'bg-wine/12 text-wine',
  charcoal: 'bg-charcoal text-ivory',
  neutral: 'bg-cream-deep text-muted',
};

export function StatusPill({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: PillTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-xs font-semibold',
        pillToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* --- Empty state ----------------------------------------------------------- */

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-stone bg-cream-deep/40 px-6 py-12 text-center">
      <div className="font-display text-2xl text-charcoal">{title}</div>
      <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  );
}
