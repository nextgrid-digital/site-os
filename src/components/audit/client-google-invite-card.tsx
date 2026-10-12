'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DEFAULT_OPERATOR_EMAIL } from '@/lib/google/operator-email';

/**
 * Instructions for clients to grant the agency Google account access, plus
 * (for the client's own in-app view) an "I've granted access" confirmation
 * so admins know who's ready for a full audit run — no email reply needed.
 */
export function ClientGoogleInviteCard({
  operatorEmail,
  className,
  audience = 'admin',
  projectId,
  confirmedAt = null,
}: {
  operatorEmail?: string | null;
  className?: string;
  /** 'client' when a paid customer is viewing this directly, 'admin' when an
   *  operator is copying it to send to a client externally. */
  audience?: 'admin' | 'client';
  /** Required when audience is 'client' — lets the confirm button call the API. */
  projectId?: string;
  confirmedAt?: string | null;
}) {
  const email = (operatorEmail?.trim() || DEFAULT_OPERATOR_EMAIL).trim();
  const [copied, setCopied] = useState(false);

  const steps = [
    '• Google Search Console → Settings → Users and permissions → Add user (Full)',
    '• GA4 → Admin → Property access management → Add users (Viewer)',
    '• Google Ads → Access and security → Add email (or under your MCC)',
  ];

  const blurb = [
    `Please add ${email} to this property:`,
    '',
    ...steps,
    '',
    "Once that's done, head back to your Site-OS dashboard and click \"I've granted access\" — we'll take it from there.",
  ].join('\n');

  async function copy() {
    try {
      await navigator.clipboard.writeText(blurb);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (audience === 'client' && confirmedAt) {
    return (
      <section
        className={
          className ??
          'rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-4'
        }
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" strokeWidth={2} />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-emerald-900">Thanks — we&apos;ve got it</h2>
            <p className="mt-1 text-sm leading-5 text-emerald-800">
              We&apos;ll get back to you once we&apos;ve run your full audit.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={
        className ??
        'rounded-[14px] border border-zinc-200/80 bg-white px-4 py-4 shadow-sm'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-950">
            {audience === 'client' ? 'Grant us access' : 'Client access instructions'}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {audience === 'client' ? (
              <>
                Add <span className="font-medium text-zinc-800">{email}</span> to your Search
                Console, GA4, and Ads — no rush, and no need to share your own Google login. Once
                it&apos;s granted, just confirm below and our team takes it from there.
              </>
            ) : (
              <>
                Paste this to any client so they can grant{' '}
                <span className="font-medium text-zinc-800">{email}</span> access.
              </>
            )}
          </p>
        </div>
        {audience === 'admin' ? (
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            {copied ? <Check className="size-3.5" strokeWidth={2} /> : <Copy className="size-3.5" strokeWidth={2} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        ) : null}
      </div>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-3 text-xs leading-5 text-zinc-700">
        {audience === 'client' ? steps.join('\n') : blurb}
      </pre>
      {projectId ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {audience === 'client' ? (
            <ConfirmAccessButton
              projectId={projectId}
              triggerLabel="I've granted access"
              dialogTitle="Confirm Google access granted"
              dialogDescription="Before we run your full audit, please double-check you've added our account to all three: Search Console, GA4, and Google Ads. Only confirm once all three are done."
              confirmLabel="Yes, I've granted access"
            />
          ) : (
            <ConfirmAccessButton
              projectId={projectId}
              triggerLabel={confirmedAt ? 'Client confirmed' : 'Mark client as confirmed'}
              triggerVariant={confirmedAt ? 'outline' : 'default'}
              dialogTitle="Mark this client as confirmed"
              dialogDescription="Use this if the client told you directly (email, call, text) instead of confirming in the app. Only confirm once you know all three — Search Console, GA4, and Ads — have actually been granted."
              confirmLabel="Yes, mark as confirmed"
            />
          )}
          {audience === 'admin' && confirmedAt ? (
            <span className="text-xs text-emerald-700">
              Confirmed {new Date(confirmedAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ConfirmAccessButton({
  projectId,
  triggerLabel,
  triggerVariant = 'default',
  dialogTitle,
  dialogDescription,
  confirmLabel,
}: {
  projectId: string;
  triggerLabel: string;
  triggerVariant?: 'default' | 'outline';
  dialogTitle: string;
  dialogDescription: string;
  confirmLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/confirm-access`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Could not confirm access.');
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm access.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className={
              triggerVariant === 'default' ? 'bg-zinc-950 text-white hover:bg-zinc-800' : undefined
            }
            variant={triggerVariant}
          />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Not yet
          </Button>
          <Button onClick={() => void confirm()} disabled={loading}>
            {loading ? 'Confirming…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
