import type React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'olive' | 'terracotta' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-cream-deep text-muted',
  olive: 'bg-olive/10 text-olive-deep',
  terracotta: 'bg-terracotta/10 text-terracotta',
};

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'font-body inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide uppercase',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Badge;
