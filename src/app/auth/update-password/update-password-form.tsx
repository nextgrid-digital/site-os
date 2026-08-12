'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/audit/app-shell';
import { createClient } from '@/utils/supabase/client';

export function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAccount = searchParams.get('from') === 'account';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.replace('/login?error=auth');
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login?error=auth');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.replace('/app');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-6.5rem)] max-w-lg flex-col justify-center">
        <p className="text-center text-sm text-slate-500">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-6.5rem)] max-w-lg flex-col justify-center">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-950">
            {fromAccount ? 'Set a password' : 'Choose a new password'}
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            {fromAccount
              ? 'Add an email and password sign-in for this account (works alongside Google).'
              : 'Enter a new password for your Site-OS account. You can then sign in with Google or email and password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save password'}
          </button>
        </form>

        {error ? <p className="mt-4 text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
