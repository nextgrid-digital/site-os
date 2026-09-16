'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/monitoring/log-error';

export default function AuditSegmentError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    logError('audit.error-boundary', error, { digest: error.digest });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">This audit hit a snag</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong loading this report. Try again, or go back to your projects.
      </p>
      <div className="flex gap-2">
        {unstable_retry ? <Button onClick={() => unstable_retry()}>Try again</Button> : null}
        <Button variant="outline" render={<Link href="/app" />}>
          Back to projects
        </Button>
      </div>
    </div>
  );
}
