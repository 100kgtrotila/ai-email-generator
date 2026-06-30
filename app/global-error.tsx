'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Global Error Boundary Caught Exception',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
      context: { category: 'UNKNOWN', action: 'GlobalErrorBoundary' },
      timestamp: new Date().toISOString(),
    }));
  }, [error]);

  return (
    <html lang="uk">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
          <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <AlertTriangle className="size-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Критична помилка
            </h2>
            <p className="text-sm text-slate-500">
              Сталася помилка на рівні додатка. Будь ласка, оновіть сторінку.
            </p>

            <button
              onClick={() => reset()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <RefreshCcw className="size-4" />
              Оновити сторінку
            </button>

            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-6 w-full rounded-lg bg-slate-100 p-4 text-left text-xs text-slate-700">
                <p className="mb-2 font-semibold text-slate-900">Technical Details (Dev Only):</p>
                <p className="break-words font-mono">{error.message}</p>
                {error.digest && <p className="mt-1 text-slate-500">Digest: {error.digest}</p>}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
