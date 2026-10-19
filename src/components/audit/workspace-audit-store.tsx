'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { useAuditTabCache } from '@/components/audit/audit-tab-cache';

export type WorkspaceAuditBundle = {
  projectId: string;
  auditRunId: string | null;
  connected: ConnectedAuditMetrics | null;
  growthBrief: unknown | null;
  brief: unknown | null;
  monthly: unknown | null;
  connect: unknown | null;
};

type WorkspaceAuditContextValue = {
  bundle: WorkspaceAuditBundle | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  invalidate: () => void;
  seed: (bundle: Partial<WorkspaceAuditBundle> & { projectId: string }) => void;
  ensureSlice: (slice: string) => Promise<void>;
  sliceLoading: Record<string, boolean>;
};

const WorkspaceAuditContext = createContext<WorkspaceAuditContextValue | null>(null);

export function useWorkspaceAudit() {
  return useContext(WorkspaceAuditContext);
}

export function useWorkspaceAuditSeed() {
  return useContext(WorkspaceAuditContext)?.seed ?? null;
}

function sliceLoaded(prev: WorkspaceAuditBundle | null, slice: string) {
  if (!prev) return false;
  switch (slice) {
    case 'dashboard':
      return Boolean(prev.connected);
    case 'brief':
      return Boolean(prev.brief);
    case 'monthly':
      return Boolean(prev.monthly);
    case 'connect':
      return Boolean(prev.connect);
    default:
      return false;
  }
}

/**
 * Shared audit data for SPA tabs — SSR seeds dashboard; other slices fetch once.
 */
export function WorkspaceAuditProvider({
  projectId,
  initial,
  children,
}: {
  projectId: string;
  initial?: Partial<WorkspaceAuditBundle> | null;
  children: ReactNode;
}) {
  const tab = useAuditTabCache();
  const [bundle, setBundle] = useState<WorkspaceAuditBundle | null>(() =>
    initial
      ? {
          projectId,
          auditRunId: initial.auditRunId ?? null,
          connected: initial.connected ?? null,
          growthBrief: initial.growthBrief ?? null,
          brief: initial.brief ?? null,
          monthly: initial.monthly ?? null,
          connect: initial.connect ?? null,
        }
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliceLoading, setSliceLoading] = useState<Record<string, boolean>>({});
  const inFlight = useRef<Set<string>>(new Set());
  const bundleRef = useRef(bundle);
  bundleRef.current = bundle;
  const lastEpoch = useRef(0);

  const seed = useCallback((next: Partial<WorkspaceAuditBundle> & { projectId: string }) => {
    setBundle((prev) => ({
      projectId: next.projectId,
      auditRunId: next.auditRunId ?? prev?.auditRunId ?? null,
      connected: next.connected ?? prev?.connected ?? null,
      growthBrief: next.growthBrief ?? prev?.growthBrief ?? null,
      brief: next.brief ?? prev?.brief ?? null,
      monthly: next.monthly ?? prev?.monthly ?? null,
      connect: next.connect ?? prev?.connect ?? null,
    }));
    setLoading(false);
    setError(null);
  }, []);

  const mergePayload = useCallback(
    (data: Record<string, unknown>) => {
      setBundle((prev) => ({
        projectId,
        auditRunId: (data.auditRunId as string | null) ?? prev?.auditRunId ?? null,
        connected:
          (data.connected as ConnectedAuditMetrics | null) ?? prev?.connected ?? null,
        // The bundle route sends every slice key (null when not requested), so a
        // null here means "not in this response" — keep what we already loaded.
        // Otherwise a Brief/Work fetch wipes the Setup slice and Google looks disconnected.
        growthBrief: (data.growthBrief as unknown) ?? prev?.growthBrief ?? null,
        brief: (data.brief as unknown) ?? prev?.brief ?? null,
        monthly: (data.monthly as unknown) ?? prev?.monthly ?? null,
        connect: (data.connect as unknown) ?? prev?.connect ?? null,
      }));
    },
    [projectId]
  );

  const ensureSlice = useCallback(
    async (slice: string) => {
      if (sliceLoaded(bundleRef.current, slice)) return;
      if (inFlight.current.has(slice)) return;
      inFlight.current.add(slice);
      setSliceLoading((s) => ({ ...s, [slice]: true }));
      try {
        const res = await fetch(
          `/api/projects/${projectId}/audit-bundle?include=${encodeURIComponent(slice)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load');
        }
        const data = (await res.json()) as Record<string, unknown>;
        mergePayload(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        inFlight.current.delete(slice);
        setSliceLoading((s) => ({ ...s, [slice]: false }));
      }
    },
    [projectId, mergePayload]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/audit-bundle?include=dashboard,brief,monthly,connect`,
        { cache: 'no-store' }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to load audit bundle');
      }
      const data = (await res.json()) as Record<string, unknown>;
      mergePayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId, mergePayload]);

  const invalidate = useCallback(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!tab) return;
    if (tab.dataEpoch === 0 || tab.dataEpoch === lastEpoch.current) return;
    lastEpoch.current = tab.dataEpoch;
    // Keep the current slices on screen while the refetch runs. Clearing them here
    // made the Setup panel flash "not connected" and drop its sources after a save.
    void refresh();
  }, [tab, refresh]);

  const value = useMemo(
    () => ({
      bundle,
      loading,
      error,
      refresh,
      invalidate,
      seed,
      ensureSlice,
      sliceLoading,
    }),
    [bundle, loading, error, refresh, invalidate, seed, ensureSlice, sliceLoading]
  );

  return (
    <WorkspaceAuditContext.Provider value={value}>{children}</WorkspaceAuditContext.Provider>
  );
}
