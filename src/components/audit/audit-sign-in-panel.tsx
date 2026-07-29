'use client';

import { useRouter } from 'next/navigation';
import { AuthSignInGate } from '@/components/audit/auth-sign-in-gate';

interface AuditSignInPanelProps {
  sessionId?: string;
  next?: string;
}

export function AuditSignInPanel({ sessionId = '', next = '/' }: AuditSignInPanelProps) {
  const router = useRouter();

  return (
    <AuthSignInGate
      sessionId={sessionId}
      headline="Sign in"
      description="Use Google or email and password. The full free audit unlocks after you authenticate."
      onUnlocked={() => {
        router.push(next);
        router.refresh();
      }}
    />
  );
}
