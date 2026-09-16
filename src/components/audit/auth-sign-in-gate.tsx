'use client';

import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { AUDIT_SESSION_COOKIE } from '@/lib/audit/session-cookie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SESSION_COOKIE = AUDIT_SESSION_COOKIE;

interface AuthSignInGateProps {
  sessionId: string;
  onUnlocked: () => void;
}

type Mode = 'signin' | 'signup' | 'forgot';

export function AuthSignInGate({
  sessionId,
  onUnlocked,
}: AuthSignInGateProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setMessage('');
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    setMessage('');
    try {
      if (sessionId) {
        document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; path=/; max-age=3600; samesite=lax`;
      }

      const supabase = createClient();
      const origin = window.location.origin;
      const redirectTo = sessionId
        ? `${origin}/auth/callback?sessionId=${encodeURIComponent(sessionId)}`
        : `${origin}/auth/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not send reset link');
        return;
      }
      setMessage(
        typeof data.message === 'string'
          ? data.message
          : 'If an account exists for that email, a reset link is on the way.'
      );
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, sessionId: sessionId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }
      onUnlocked();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'forgot') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send a link to choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleForgotSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2Icon className="size-4 animate-spin" /> : null}
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => switchMode('signin')} className="w-full">
              Back to sign in
            </Button>
          </form>

          {message ? <p className="text-sm text-success">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-sm">
      <CardHeader>
        <CardTitle className="sr-only">{mode === 'signup' ? 'Create your account' : 'Sign in'}</CardTitle>
        <CardDescription className="text-center">
          {mode === 'signup' ? 'Set up your Site-OS account to continue.' : 'Sign in to continue to Site-OS.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs  value={mode} onValueChange={(value) => switchMode(value as Mode)}>
          <TabsList className="w-full">
            <TabsTrigger className="rounded-sm h-8" value="signin">Sign in</TabsTrigger>
            <TabsTrigger className="rounded-sm h-8" value="signup">Sign up</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
            className="rounded-sm h-9"
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === 'signin' ? (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Forgot password?
                </button>
              ) : null}
            </div>
            <Input
              id="password"
              type="password"
              className="rounded-sm h-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {mode === 'signup' ? (
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                className="rounded-sm h-9"
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          ) : null}

          <Button type="submit" disabled={loading || googleLoading} className="w-full rounded-sm cursor-pointer h-12">
            {loading ? <Loader2Icon className="size-4 animate-spin" /> : null}
            {loading
              ? mode === 'signup'
                ? 'Creating account…'
                : 'Signing in…'
              : mode === 'signup'
                ? 'Create account'
                : 'Sign in'}
          </Button>
        </form>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or Google</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full gap-2 rounded-sm h-12 cursor-pointer hover:bg-white/90"
        >
          <GoogleIcon />
          {googleLoading
            ? 'Redirecting…'
            : mode === 'signup'
              ? 'Sign up with Google'
              : 'Continue with Google'}
        </Button>
      </CardContent>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}
