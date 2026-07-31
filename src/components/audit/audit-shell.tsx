import type { ReactNode } from 'react';
import { AppShell } from '@/components/audit/app-shell';

/** @deprecated Prefer AppShell — kept as a thin alias for any remaining imports. */
export function AuditShell({ children }: { children: ReactNode }) {
  return (
    <AppShell showSignIn>
      {children}
    </AppShell>
  );
}
