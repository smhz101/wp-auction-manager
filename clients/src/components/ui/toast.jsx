import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Toast({ open, type = 'success', message, onOpenChange }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onOpenChange(false), 3000);
    return () => clearTimeout(t);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed bottom-wp-4 right-wp-4 rounded-sm px-wp-3 py-wp-1 text-wp-base text-wp-white shadow-lg',
        type === 'error' ? 'bg-wp-red' : 'bg-wp-blue'
      )}
    >
      {message}
    </div>
  );
}
