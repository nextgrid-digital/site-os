import { AuthSignInGate } from '@/components/audit/auth-sign-in-gate';

interface ReportAuthGateProps {
  sessionId: string;
  domain: string;
  websiteUrl: string;
  analyzing: boolean;
  failed?: boolean;
  teaser?: unknown;
  onUnlocked: () => void;
}

/** Minimal login gate for deep-linked /audit/[sessionId] when signed out. */
export function ReportAuthGate({
  sessionId,
  domain,
  websiteUrl,
  analyzing,
  onUnlocked,
}: ReportAuthGateProps) {
  return (
    <div className="mx-auto max-w-md space-y-8 py-6">
      <header className="space-y-2 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-600">
          {analyzing ? 'Analysis running' : 'Site-OS audit'}
        </p>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{domain}</h1>
          <p className="text-sm text-slate-500">{websiteUrl}</p>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Sign in to open your Site-OS audit for {domain}.
        </p>
      </header>

      <AuthSignInGate sessionId={sessionId} onUnlocked={onUnlocked} />
    </div>
  );
}
