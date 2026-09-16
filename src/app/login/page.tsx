import { AppShell } from '@/components/audit/app-shell';
import { AuditSignInPanel } from '@/components/audit/audit-sign-in-panel';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; sessionId?: string }>;
}) {
  const params = await searchParams;
  const next =
    typeof params.next === 'string' && params.next.startsWith('/')
      ? params.next
      : params.sessionId
        ? `/app?session=${encodeURIComponent(params.sessionId)}`
        : '/app';
  const sessionId =
    typeof params.sessionId === 'string'
      ? params.sessionId
      : next.startsWith('/audit/')
        ? next.slice('/audit/'.length).split(/[/?#]/)[0]
        : next.startsWith('/app')
          ? ''
          : '';
  const showError = params.error === 'auth';

  return (
    <AppShell showSignIn={false}>
      <div className="absolute inset-0 flex items-center max-w-lg mx-auto flex-col justify-center gap-4">
        {showError ? (
          <p className="text-center text-sm text-red-600">Authentication failed. Please try again.</p>
        ) : null}
        <AuditSignInPanel sessionId={sessionId} next={next} />
      </div>
    </AppShell>
  );
}
