'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_TRIGGER_CLASS =
  'inline-flex h-auto items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50';

export function AddSiteAuditDialog({
  triggerClassName,
  triggerLabel = 'Add site',
}: {
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong');
        return;
      }

      const sessionId = typeof data.sessionId === 'string' ? data.sessionId : '';
      if (!sessionId) {
        setError('Something went wrong');
        return;
      }

      setOpen(false);
      setUrl('');
      router.push(`/audit/${sessionId}`);
    } catch {
      setError('Failed to start audit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setError(null);
          setUrl('');
        }
      }}
    >
      <DialogTrigger
        render={
          <button type="button" className={triggerClassName ?? DEFAULT_TRIGGER_CLASS} />
        }
      >
        <span className="text-base leading-none">+</span>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a site</DialogTitle>
            <DialogDescription>
              Paste any public URL to start a free audit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-site-url">Website URL</Label>
              <Input
                id="add-site-url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="yourwebsite.com"
                required
                disabled={loading}
                autoFocus
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Starting analysis…' : 'Analyze website'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
