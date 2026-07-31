import Link from 'next/link';
import { AppShell } from '@/components/audit/app-shell';
import { AuditSignInPanel } from '@/components/audit/audit-sign-in-panel';
import { SponsorBanner } from '@/components/audit/sponsor-banner';

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
      <div className="mx-auto max-w-lg space-y-8 pt-2">
        <div className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Account</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Sign in to unlock your audit
          </h1>
          <p className="text-sm leading-6 text-zinc-500">
            Use Google or email and password. The full free audit is available after you sign in.
          </p>
          {showError ? (
            <p className="text-sm text-red-600">Authentication failed. Please try again.</p>
          ) : null}
        </div>
        <AuditSignInPanel sessionId={sessionId} next={next} />
        <SponsorBanner />
        <p className="text-center text-sm text-zinc-500">
          <Link href="/#audit" className="font-medium text-zinc-800 underline-offset-2 hover:underline">
            Analyze a website URL
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
