'use client';

import { useState } from 'react';

interface EmailGateProps {
  projectId: string;
  onVerified: (email: string) => void;
}

export function EmailGate({ projectId, onVerified }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestCode() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `project:${projectId}`, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send code');
        return;
      }
      setStep('code');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/audit/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed');
        return;
      }
      onVerified(email);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-4">
      <div className="w-full space-y-4 rounded-2xl border border-white/10 bg-[#141416] p-8">
        <h2 className="text-xl font-semibold text-white">Access your audit</h2>
        <p className="text-sm text-white/60">
          Enter the email associated with this audit to view your report.
        </p>

        {step === 'email' ? (
          <>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
            />
            <button
              onClick={handleRequestCode}
              disabled={loading || !email}
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send access code'}
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-white/50">
              Code sent to <span className="text-white/80">{email}</span>
            </p>
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-center text-lg tracking-widest text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
            />
            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
