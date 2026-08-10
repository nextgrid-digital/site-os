'use client';

import { useEffect } from 'react';
import { AuthSignInGate } from '@/components/audit/auth-sign-in-gate';

interface AuthModalProps {
  open: boolean;
  sessionId: string;
  domain: string;
  onClose: () => void;
  onUnlocked: () => void;
}

export function AuthModal({ open, sessionId, onClose, onUnlocked }: AuthModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Sign in to Site-OS">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        aria-label="Close sign in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md">
        <AuthSignInGate sessionId={sessionId} onUnlocked={onUnlocked} />
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-center text-xs font-medium text-white/80 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
