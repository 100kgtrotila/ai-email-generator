import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  readonly className?: string;
  readonly size?: number;
}

export function LoadingSpinner({ className, size = 16 }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin', className)}
      size={size}
      aria-label="Loading"
      role="status"
    />
  );
}
