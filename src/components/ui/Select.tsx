import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  id: string;
}

const fieldBase =
  'w-full appearance-none bg-marble border border-stone rounded-md px-4 py-2.5 font-body text-charcoal transition-colors cursor-pointer';

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="pointer-events-none"
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="font-body text-charcoal text-sm font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(fieldBase, 'pr-10', error && 'border-wine', className)}
            {...rest}
          >
            {children}
          </select>
          <span className="text-muted pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronIcon />
          </span>
        </div>
        {error && (
          <p id={`${id}-error`} className="font-body text-wine text-sm">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
