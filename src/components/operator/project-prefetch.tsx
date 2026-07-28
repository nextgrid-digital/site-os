'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const TAB_SUFFIXES = ['', '/report', '/audit', '/connect', '/settings', '/findings', '/architecture', '/pricing'];

export function ProjectPrefetch({ projectId }: { projectId: string }) {
  const router = useRouter();

  useEffect(() => {
    for (const suffix of TAB_SUFFIXES) {
      router.prefetch(`/operator/projects/${projectId}${suffix}`);
    }
  }, [projectId, router]);

  return null;
}
