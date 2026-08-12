'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AuditRunContextValue = {
  running: boolean;
  error: string | null;
  startRunning: () => void;
  stopRunning: (error?: string | null) => void;
  clearError: () => void;
};

const AuditRunContext = createContext<AuditRunContextValue | null>(null);

export function AuditRunProvider({ children }: { children: ReactNode }) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRunning = useCallback(() => {
    setError(null);
    setRunning(true);
  }, []);

  const stopRunning = useCallback((nextError?: string | null) => {
    setRunning(false);
    setError(nextError ?? null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ running, error, startRunning, stopRunning, clearError }),
    [running, error, startRunning, stopRunning, clearError]
  );

  return <AuditRunContext.Provider value={value}>{children}</AuditRunContext.Provider>;
}

export function useAuditRun() {
  const ctx = useContext(AuditRunContext);
  if (!ctx) {
    throw new Error('useAuditRun must be used within AuditRunProvider');
  }
  return ctx;
}

/** Safe for buttons rendered outside the provider (returns no-ops). */
export function useOptionalAuditRun() {
  return useContext(AuditRunContext);
}
