'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

export type AuditPrimaryTabSuffix =
  | '/workflow'
  | '/brief'
  | '/work'
  | '/leads'
  | '/monthly'
  | '/connect';

export const AUDIT_PRIMARY_TAB_SUFFIXES: readonly AuditPrimaryTabSuffix[] = [
  '/workflow',
  '/brief',
  '/work',
  '/leads',
  '/monthly',
  '/connect',
];

type SpaTabContextValue = {
  workspaceId: string;
  activeSuffix: AuditPrimaryTabSuffix;
  setTab: (suffix: AuditPrimaryTabSuffix) => void;
  /** Bump to force client panels to refetch. */
  dataEpoch: number;
  invalidateTab: (suffix: AuditPrimaryTabSuffix) => void;
  invalidateAll: () => void;
};

const SpaTabContext = createContext<SpaTabContextValue | null>(null);

export function useAuditTabCache() {
  return useContext(SpaTabContext);
}

export function useInvalidateAuditTab() {
  const ctx = useAuditTabCache();
  return useCallback(
    (_suffix: AuditPrimaryTabSuffix) => {
      ctx?.invalidateAll();
    },
    [ctx]
  );
}

/** Parse primary tab from any `/audit/:id/...` pathname (session or project id). */
export function parseAuditPrimaryTabSuffix(pathname: string): AuditPrimaryTabSuffix | null {
  const match = pathname.match(/^\/audit\/[^/]+(\/[^/?#]*)?/);
  if (!match) return null;
  const rest = match[1] ?? '';
  if (!rest || rest === '/') return '/workflow';
  for (const suffix of AUDIT_PRIMARY_TAB_SUFFIXES) {
    if (rest === suffix || rest.startsWith(`${suffix}/`)) return suffix;
  }
  return null;
}

/**
 * SPA tab router — pushState only, never router.push for primary tabs.
 */
export function AuditSpaTabProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const initial = parseAuditPrimaryTabSuffix(pathname) ?? '/workflow';
  const [activeSuffix, setActiveSuffix] = useState<AuditPrimaryTabSuffix>(initial);
  const [dataEpoch, setDataEpoch] = useState(0);

  // Sync from real Next navigations (Sites → audit) and browser back/forward.
  useEffect(() => {
    const suffix = parseAuditPrimaryTabSuffix(pathname);
    if (suffix) setActiveSuffix(suffix);
  }, [pathname]);

  useEffect(() => {
    function onPopState() {
      const suffix = parseAuditPrimaryTabSuffix(window.location.pathname);
      if (suffix) setActiveSuffix(suffix);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Canonicalize URL to session workspaceId without RSC navigation.
  useEffect(() => {
    const suffix = activeSuffix;
    const canonical = `/audit/${workspaceId}${suffix}`;
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== canonical) {
      window.history.replaceState(window.history.state, '', canonical);
    }
  }, [workspaceId, activeSuffix]);

  const setTab = useCallback(
    (suffix: AuditPrimaryTabSuffix) => {
      setActiveSuffix(suffix);
      const href = `/audit/${workspaceId}${suffix}`;
      if (window.location.pathname !== href) {
        window.history.pushState(null, '', href);
      }
    },
    [workspaceId]
  );

  const invalidateAll = useCallback(() => {
    setDataEpoch((n) => n + 1);
  }, []);

  const invalidateTab = useCallback(
    (_suffix: AuditPrimaryTabSuffix) => {
      invalidateAll();
    },
    [invalidateAll]
  );

  const value = useMemo(
    () => ({
      workspaceId,
      activeSuffix,
      setTab,
      dataEpoch,
      invalidateTab,
      invalidateAll,
    }),
    [workspaceId, activeSuffix, setTab, dataEpoch, invalidateTab, invalidateAll]
  );

  return <SpaTabContext.Provider value={value}>{children}</SpaTabContext.Provider>;
}

/** @deprecated Alias kept for imports during cutover. */
export const AuditTabCacheProvider = AuditSpaTabProvider;
