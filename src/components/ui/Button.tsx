import type React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  solid: 'bg-olive text-ivory hover:bg-olive-deep',
  outline: 'border border-olive text-olive hover:bg-olive hover:text-ivory',
  ghost: 'text-olive hover:underline',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

const baseClasses =
  'inline-flex items-center justify-center font-body font-medium rounded-md transition-colors focus-visible:outline-none cursor-pointer select-none';

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
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

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
