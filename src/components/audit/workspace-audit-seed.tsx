'use client';

import { useEffect } from 'react';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { useWorkspaceAuditSeed } from '@/components/audit/workspace-audit-store';

/**
 * Pushes SSR Dashboard metrics into WorkspaceAuditStore so the client does not re-fetch.
 */
export function WorkspaceAuditSeed({
  projectId,
  auditRunId,
  connected,
  growthBrief,
}: {
  projectId: string;
  auditRunId: string | null;
  connected: ConnectedAuditMetrics;
  growthBrief: unknown | null;
}) {
  const seed = useWorkspaceAuditSeed();

  useEffect(() => {
    seed?.({
      projectId,
      auditRunId,
      connected,
      growthBrief,
      work: null,
    });
  }, [seed, projectId, auditRunId, connected, growthBrief]);

  return null;
}
