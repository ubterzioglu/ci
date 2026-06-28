import type React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'bg-marble border border-stone-soft rounded-lg p-6',
        hover && 'transition-shadow hover:shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export function CardBody({ className, children, ...rest }: CardBodyProps) {
  return (
    <div className={cn('text-charcoal font-body', className)} {...rest}>
      {children}
    </div>
  );
}

export default Card;
