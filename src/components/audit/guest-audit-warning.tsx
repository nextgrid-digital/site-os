'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/** Guests keep their audits in this browser only; signing in attaches them to an account. */
export function GuestAuditWarningBody({
  loginHref,
  onContinue,
  onCancel,
  continueLabel = 'Run new audit anyway',
  loading = false,
}: {
  loginHref: string;
  onContinue: () => void;
  onCancel: () => void;
  continueLabel?: string;
  loading?: boolean;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Your current audit may be lost</DialogTitle>
        <DialogDescription>
          You&apos;re not logged in, so this audit is only saved in this browser. Starting a new
          one could make you lose access to it. Log in to save your audits and keep them on your
          account.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onContinue} disabled={loading}>
          {loading ? 'Starting…' : continueLabel}
        </Button>
        <Button render={<Link href={loginHref} />} nativeButton={false} onClick={onCancel}>
          Log in to save
        </Button>
      </DialogFooter>
    </>
  );
}

export function GuestAuditWarningDialog({
  open,
  onOpenChange,
  ...bodyProps
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loginHref: string;
  onContinue: () => void;
  continueLabel?: string;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <GuestAuditWarningBody {...bodyProps} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
