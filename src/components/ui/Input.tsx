import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

const fieldBase =
  'w-full bg-marble border border-stone rounded-md px-4 py-2.5 font-body text-charcoal placeholder:text-muted transition-colors';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="font-body text-sm font-medium text-charcoal"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(fieldBase, error && 'border-wine', className)}
          {...rest}
        />
        {error && (
          <p id={`${id}-error`} className="font-body text-sm text-wine">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
