'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InfoIcon, Loader2Icon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      <div className="mx-auto flex absolute inset-0 max-w-lg flex-col justify-center">
        <p className="text-center text-sm text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex absolute inset-0 max-w-lg flex-col justify-center">
      <Card className="w-full rounded-sm">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle className="!font-sans">
              {fromAccount ? 'Set a password' : 'Choose a new password'}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  aria-label="More info"
                  className="inline-flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <InfoIcon className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  {fromAccount
                    ? 'Add an email and password sign-in for this account (works alongside Google).'
                    : 'Enter a new password for your Site-OS account. You can then sign in with Google or email and password.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="rounded-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password">Confirm password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="rounded-sm h-9"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm cursor-pointer h-12"
            >
              {loading ? <Loader2Icon className="size-4 animate-spin" /> : null}
              {loading ? 'Saving…' : 'Save password'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="w-full rounded-sm cursor-pointer"
            >
              Back
            </Button>
          </form>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
