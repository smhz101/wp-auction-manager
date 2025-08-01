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
        'fixed bottom-4 right-4 rounded-md px-4 py-2 text-sm text-white shadow-lg',
        type === 'error' ? 'bg-destructive' : 'bg-primary'
      )}
    >
      {message}
    </div>
  );
}
