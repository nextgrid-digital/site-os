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
import { usePathname, useRouter } from 'next/navigation';

export type AuditPrimaryTabSuffix = '' | '/journey' | '/connect' | '/intake';

export const AUDIT_PRIMARY_TAB_SUFFIXES: readonly AuditPrimaryTabSuffix[] = [
  '',
  '/journey',
  '/connect',
  '/intake',
];

type AuditTabCacheContextValue = {
  workspaceId: string;
  activeSuffix: AuditPrimaryTabSuffix | null;
  isCached: (suffix: AuditPrimaryTabSuffix) => boolean;
  activateTab: (suffix: AuditPrimaryTabSuffix) => void;
  invalidateTab: (suffix: AuditPrimaryTabSuffix) => void;
  invalidateAll: () => void;
};

const AuditTabCacheContext = createContext<AuditTabCacheContextValue | null>(null);

export function useAuditTabCache() {
  return useContext(AuditTabCacheContext);
}

export function useInvalidateAuditTab() {
  const ctx = useAuditTabCache();
  return useCallback(
    (suffix: AuditPrimaryTabSuffix) => {
      ctx?.invalidateTab(suffix);
    },
    [ctx]
  );
}

export function parseAuditPrimaryTabSuffix(
  pathname: string,
  base: string
): AuditPrimaryTabSuffix | null {
  if (pathname === base || pathname === `${base}/`) return '';
  for (const suffix of AUDIT_PRIMARY_TAB_SUFFIXES) {
    if (suffix === '') continue;
    if (pathname === `${base}${suffix}` || pathname.startsWith(`${base}${suffix}/`)) {
      return suffix;
    }
  }
  return null;
}

type Store = {
  cache: Map<AuditPrimaryTabSuffix, ReactNode>;
  invalidated: Set<AuditPrimaryTabSuffix>;
};

const StoreContext = createContext<Store | null>(null);
const PathMetaContext = createContext<{
  pathSuffix: AuditPrimaryTabSuffix | null;
  activeSuffix: AuditPrimaryTabSuffix | null;
  optimisticSuffix: AuditPrimaryTabSuffix | null;
} | null>(null);

export function AuditTabCacheProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/audit/${workspaceId}`;
  const pathSuffix = parseAuditPrimaryTabSuffix(pathname, base);

  const [optimisticSuffix, setOptimisticSuffix] = useState<AuditPrimaryTabSuffix | null>(
    null
  );
  const [, setCacheEpoch] = useState(0);

  const storeRef = useRef<Store>({
    cache: new Map(),
    invalidated: new Set(),
  });

  useEffect(() => {
    storeRef.current.cache.clear();
    storeRef.current.invalidated.clear();
    setOptimisticSuffix(null);
    setCacheEpoch((n) => n + 1);
  }, [workspaceId]);

  useEffect(() => {
    if (optimisticSuffix !== null && pathSuffix === optimisticSuffix) {
      setOptimisticSuffix(null);
    }
  }, [pathSuffix, optimisticSuffix]);

  const activeSuffix = optimisticSuffix ?? pathSuffix;

  const isCached = useCallback((suffix: AuditPrimaryTabSuffix) => {
    const { cache, invalidated } = storeRef.current;
    return cache.has(suffix) && !invalidated.has(suffix);
  }, []);

  const invalidateTab = useCallback((suffix: AuditPrimaryTabSuffix) => {
    storeRef.current.invalidated.add(suffix);
    setCacheEpoch((n) => n + 1);
  }, []);

  const invalidateAll = useCallback(() => {
    for (const s of AUDIT_PRIMARY_TAB_SUFFIXES) {
      storeRef.current.invalidated.add(s);
    }
    setCacheEpoch((n) => n + 1);
  }, []);

  const activateTab = useCallback(
    (suffix: AuditPrimaryTabSuffix) => {
      const href = `${base}${suffix}`;
      if (storeRef.current.cache.has(suffix)) {
        setOptimisticSuffix(suffix);
      }
      router.push(href);
    },
    [base, router]
  );

  const value = useMemo<AuditTabCacheContextValue>(
    () => ({
      workspaceId,
      activeSuffix,
      isCached,
      activateTab,
      invalidateTab,
      invalidateAll,
    }),
    [workspaceId, activeSuffix, isCached, activateTab, invalidateTab, invalidateAll]
  );

  const pathMeta = useMemo(
    () => ({ pathSuffix, activeSuffix, optimisticSuffix }),
    [pathSuffix, activeSuffix, optimisticSuffix]
  );

  return (
    <AuditTabCacheContext.Provider value={value}>
      <StoreContext.Provider value={storeRef.current}>
        <PathMetaContext.Provider value={pathMeta}>{children}</PathMetaContext.Provider>
      </StoreContext.Provider>
    </AuditTabCacheContext.Provider>
  );
}

/**
 * Keeps primary audit tab panels mounted across soft navigations so revisits are instant.
 */
export function AuditTabPanels({ children }: { children: ReactNode }) {
  const store = useContext(StoreContext);
  const pathMeta = useContext(PathMetaContext);

  if (!store || !pathMeta) {
    return <>{children}</>;
  }

  const { pathSuffix, activeSuffix, optimisticSuffix } = pathMeta;

  if (pathSuffix !== null) {
    const shouldReplace =
      !store.cache.has(pathSuffix) || store.invalidated.has(pathSuffix);
    if (shouldReplace) {
      store.cache.set(pathSuffix, children);
      store.invalidated.delete(pathSuffix);
    }
  }

  if (pathSuffix === null && optimisticSuffix === null) {
    return <>{children}</>;
  }

  return (
    <>
      {AUDIT_PRIMARY_TAB_SUFFIXES.map((suffix) => {
        const node = store.cache.get(suffix);
        if (!node) return null;
        const active = suffix === activeSuffix;
        return (
          <div
            key={suffix || 'evidence'}
            hidden={!active}
            {...(!active ? { inert: true } : {})}
          >
            {node}
          </div>
        );
      })}
      {activeSuffix !== null && !store.cache.has(activeSuffix) ? children : null}
    </>
  );
}
