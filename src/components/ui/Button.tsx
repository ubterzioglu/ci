import type React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Variants map to the premium `.btn-*` system defined in globals.css.
// `solid` / `outline` / `ghost` sit on light surfaces; `glass` / `glass-outline`
// sit on dark photographic sections (Hero, reservation band).
type Variant = 'solid' | 'outline' | 'ghost' | 'glass' | 'glass-outline';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  solid: 'btn-solid',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  glass: 'btn-glass',
  'glass-outline': 'btn-glass-outline',
};

const sizeClasses: Record<Size, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

const baseClasses = 'btn';

// Props when rendering as a <button>
type ButtonAsButton = {
  href?: undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

// Props when rendering as a Next.js <Link>
type ButtonAsLink = {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

type ButtonProps = (ButtonAsButton | ButtonAsLink) & {
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function Button({
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  if (rest.href !== undefined) {
    const { href, ...anchorRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}

export default Button;
