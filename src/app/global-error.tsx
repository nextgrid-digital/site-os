'use client';

import { useEffect } from 'react';
import { logError } from '@/lib/monitoring/log-error';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    logError('app.global-error-boundary', error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center font-sans">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          We hit an unexpected error loading the app. Please try again.
        </p>
        {unstable_retry ? (
          <button
            onClick={() => unstable_retry()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        ) : null}
      </body>
    </html>
  );
}
