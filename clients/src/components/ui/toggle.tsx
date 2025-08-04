import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Toggle({ checked, onCheckedChange, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border border-wp-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wp-blue',
        checked ? 'bg-wp-blue' : 'bg-wp-gray-300',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-wp-white shadow transition-transform',
          checked ? 'translate-x-[20px]' : 'translate-x-[4px]'
        )}
      />
    </button>
  );
}
