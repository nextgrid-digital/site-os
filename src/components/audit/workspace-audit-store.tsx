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
  aeo: unknown | null;
  connect: unknown | null;
};

/**
 * 'analyzing' while the first free audit is still crawling, 'ready' once it finished,
 * 'failed' if it errored, 'none' when this project has no audit session at all.
 */
export type FreeAuditStatus = 'analyzing' | 'ready' | 'failed' | 'none';

const AUDIT_STATUS_POLL_MS = 3000;

type WorkspaceAuditContextValue = {
  bundle: WorkspaceAuditBundle | null;
  loading: boolean;
  error: string | null;
  auditStatus: FreeAuditStatus | null;
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
    case 'aeo':
      return Boolean(prev.aeo);
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
          aeo: initial.aeo ?? null,
          connect: initial.connect ?? null,
        }
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditStatus, setAuditStatus] = useState<FreeAuditStatus | null>(null);
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
      aeo: next.aeo ?? prev?.aeo ?? null,
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
        aeo: (data.aeo as unknown) ?? prev?.aeo ?? null,
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
        `/api/projects/${projectId}/audit-bundle?include=dashboard,brief,monthly,aeo,connect`,
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

  // Until the first audit run exists, poll the audit status. When it finishes, reload
  // the bundle so the brief and tasks appear without a manual refresh.
  const bundleLoaded = bundle !== null;
  const hasAuditRun = Boolean(bundle?.auditRunId);
  useEffect(() => {
    if (!bundleLoaded || hasAuditRun) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await fetch(`/api/audit/${projectId}/status`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.status === 404) {
          setAuditStatus('none');
          return;
        }
        if (!res.ok) {
          // Server error: keep polling rather than claim there is no audit.
          if (!cancelled) timer = setTimeout(poll, AUDIT_STATUS_POLL_MS);
          return;
        }
        const data = (await res.json()) as { status: string; ready: boolean };
        if (cancelled) return;
        if (data.status === 'failed') {
          setAuditStatus('failed');
          return;
        }
        if (data.ready) {
          setAuditStatus('ready');
          // Keep polling until the bundle actually reports the run (hasAuditRun flips).
          void refresh();
        } else {
          setAuditStatus('analyzing');
        }
      } catch {
        // Transient network error: keep polling.
      }
      if (!cancelled) timer = setTimeout(poll, AUDIT_STATUS_POLL_MS);
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [bundleLoaded, hasAuditRun, projectId, refresh]);

  const value = useMemo(
    () => ({
      bundle,
      loading,
      error,
      auditStatus,
      refresh,
      invalidate,
      seed,
      ensureSlice,
      sliceLoading,
    }),
    [bundle, loading, error, auditStatus, refresh, invalidate, seed, ensureSlice, sliceLoading]
  );

  return (
    <WorkspaceAuditContext.Provider value={value}>{children}</WorkspaceAuditContext.Provider>
  );
}
