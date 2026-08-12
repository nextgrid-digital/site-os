'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { SiteCardFavicon } from '@/components/audit/site-card-favicon';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type SitesDashboardSite = {
  sessionId: string;
  projectId: string;
  name: string;
  domain: string;
  findingsCount: number | null;
  status: string;
};

function SiteStatusStrip({ status }: { status: string }) {
  const label =
    status === 'pending' || status === 'teaser_ready'
      ? 'Analyzing'
      : status === 'failed'
        ? 'Failed'
        : status === 'free_ready'
          ? 'Ready'
          : 'Audit';

  return (
    <div className="flex h-16 items-center rounded-xl bg-zinc-50 px-3" aria-hidden="true">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
    </div>
  );
}

export function SiteCard({
  site,
  highlighted,
  onDeleted,
}: {
  site: SitesDashboardSite;
  highlighted?: boolean;
  onDeleted: (projectId: string) => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = `/audit/${site.sessionId}`;

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${site.projectId}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to delete site.');
        setLoading(false);
        return;
      }
      setConfirmOpen(false);
      onDeleted(site.projectId);
    } catch {
      setError('Failed to delete site.');
      setLoading(false);
    }
  }

  return (
    <li className="relative">
      <Link
        href={href}
        prefetch
        onMouseEnter={() => {
          router.prefetch(href);
        }}
        className={`block rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md ${
          highlighted ? 'ring-1 ring-zinc-900' : ''
        }`}
      >
        <div className="mb-4 flex items-start gap-3 pr-8">
          <SiteCardFavicon domain={site.domain} name={site.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-950">{site.name}</p>
            <p className="truncate text-xs text-zinc-500">{site.domain}</p>
          </div>
        </div>
        <SiteStatusStrip status={site.status} />
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-zinc-950" aria-hidden="true" />
            Findings
          </span>
          <span className="font-medium text-zinc-950">
            {site.findingsCount ?? (site.status === 'pending' ? '…' : 0)}
          </span>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Delete ${site.domain || site.name}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setError(null);
          setConfirmOpen(true);
        }}
        className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900"
      >
        <Trash2 className="size-3.5" />
      </button>

      {confirmOpen ? (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-sm" showCloseButton={!loading}>
            <DialogHeader>
              <DialogTitle>Delete {site.domain || site.name}?</DialogTitle>
              <DialogDescription>
                This removes it from your sites. You can audit the URL again later.
              </DialogDescription>
            </DialogHeader>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={loading}
                onClick={() => void handleDelete()}
              >
                {loading ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </li>
  );
}
