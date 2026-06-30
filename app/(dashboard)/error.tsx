'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Dashboard Error Boundary Caught Exception',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
      context: { category: 'UNKNOWN', action: 'DashboardErrorBoundary' },
      timestamp: new Date().toISOString(),
    }));
  }, [error]);

  return (
    <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-12 text-center shadow-sm">
      <div className="rounded-full bg-red-100 p-3 text-red-600">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Помилка завантаження дашборду
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Не вдалося завантажити цей компонент. Інші частини сайту продовжують працювати.
      </p>

      <Button variant="outline" onClick={() => reset()} className="mt-6 gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
        <RefreshCcw className="size-4" />
        Спробувати ще раз
      </Button>

      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 w-full max-w-lg rounded-lg bg-white/60 p-4 text-left text-xs text-red-800 ring-1 ring-red-200">
          <p className="font-semibold">Dev Details:</p>
          <p className="mt-1 break-words font-mono">{error.message}</p>
          {error.digest && <p className="mt-1 opacity-75">Digest: {error.digest}</p>}
        </div>
      )}
    </div>
  );
}
