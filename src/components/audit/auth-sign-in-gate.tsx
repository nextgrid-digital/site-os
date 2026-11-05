'use client';

import { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { AUDIT_SESSION_COOKIE } from '@/lib/audit/session-cookie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const SESSION_COOKIE = AUDIT_SESSION_COOKIE;

interface AuthSignInGateProps {
  sessionId: string;
  onUnlocked: () => void;
}

type Step = 'email' | 'code';

const RESEND_COOLDOWN_SECONDS = 30;
const AGE_ERROR = 'Please confirm you are 18 or older to continue.';

export function AuthSignInGate({
  sessionId,
  onUnlocked,
}: AuthSignInGateProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleGoogle() {
    if (!ageConfirmed) {
      setError(AGE_ERROR);
      return;
    }
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

  async function sendCode(): Promise<boolean> {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ageConfirmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not send a code');
        return false;
      }
      setCooldown(RESEND_COOLDOWN_SECONDS);
      return true;
    } catch {
      setError('Something went wrong. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await sendCode()) {
      setCode('');
      setStep('code');
    }
  }

  async function handleResend() {
    if (cooldown > 0 || loading) return;
    if (await sendCode()) setMessage('A new code is on the way.');
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code, sessionId: sessionId || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Verification failed');
        return;
      }
      onUnlocked();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function backToEmail() {
    setStep('email');
    setCode('');
    setError('');
    setMessage('');
  }

  return (
    <Card className="w-full gap-5 rounded-xl bg-raised p-6 shadow-sm ring-1 ring-border sm:p-8">
      <CardHeader className="gap-1 px-0">
        <CardTitle className="font-sans text-2xl font-semibold tracking-tight text-foreground">
          {step === 'code' ? 'Check your email' : 'Sign in or sign up'}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {step === 'code'
            ? `We sent a code to ${email}. Enter it below to continue.`
            : "Enter your email and we'll send you a one-time code. No password needed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                className="h-10 rounded-xl"
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <AgeCheckbox checked={ageConfirmed} onChange={setAgeConfirmed} />
            <Button type="submit" disabled={loading || googleLoading || !ageConfirmed} className="mt-2 h-11 w-full cursor-pointer rounded-xl">
              {loading ? <Loader2Icon className="size-4 animate-spin" /> : null}
              {loading ? 'Sending code…' : 'Continue with email'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="otp-code">Verification code</Label>
              <Input
                className="h-11 rounded-xl text-center text-lg tracking-[0.4em]"
                id="otp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                autoComplete="one-time-code"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || code.length < 6}
              className="mt-2 h-11 w-full cursor-pointer rounded-xl"
            >
              {loading ? <Loader2Icon className="size-4 animate-spin" /> : null}
              {loading ? 'Verifying…' : 'Verify and continue'}
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={backToEmail}
                className="font-medium text-muted-foreground transition hover:text-foreground"
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {message ? <p className="text-sm text-success">{message}</p> : null}
        {error ? <p className="text-sm text-danger-ink">{error}</p> : null}

        {step === 'email' ? (
          <>
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={googleLoading || loading || !ageConfirmed}
              className="h-11 w-full cursor-pointer gap-2 rounded-xl hover:bg-tint"
            >
              <GoogleIcon />
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AgeCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer"
      />
      <span>
        I am 18 or older and agree to the{' '}
        <a href="/terms" target="_blank" rel="noreferrer" className="underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" target="_blank" rel="noreferrer" className="underline">
          Privacy Policy
        </a>
        .
      </span>
    </label>
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
