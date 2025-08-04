import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[40px] w-full rounded-sm border border-wp-gray-300 bg-wp-white px-wp-2 py-wp-1 font-sans text-wp-base shadow-sm placeholder:text-wp-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wp-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
