import { Suspense } from 'react';
import { AppShell } from '@/components/audit/app-shell';
import { UpdatePasswordForm } from './update-password-form';

export default function UpdatePasswordPage() {
  return (
    <AppShell showSignIn={false}>
      <Suspense
        fallback={
          <div className="mx-auto flex min-h-[calc(100dvh-6.5rem)] max-w-lg flex-col justify-center">
            <p className="text-center text-sm text-slate-500">Loading…</p>
          </div>
        }
      >
        <UpdatePasswordForm />
      </Suspense>
    </AppShell>
  );
}
