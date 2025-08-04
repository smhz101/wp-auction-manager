import * as React from 'react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ value, options, onChange, className }: SelectProps) {
  return (
    <select
      className={cn(
        'h-[40px] w-full rounded-sm border border-wp-gray-300 bg-wp-white px-wp-2 py-wp-1 font-sans text-wp-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wp-blue focus-visible:ring-offset-2',
        className
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
