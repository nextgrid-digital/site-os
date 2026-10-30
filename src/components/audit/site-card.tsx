'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { SiteSourceConnectionIcons } from '@/components/audit/google-source-icons';
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
  connections: {
    gsc: boolean;
    ga4: boolean;
    ads: boolean;
  };
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
    <div
      className="flex h-16 items-center px-3"
      aria-hidden="true"
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
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
  const href = `/audit/${site.sessionId}/workflow`;

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
          router.prefetch(`/audit/${site.sessionId}/brief`);
        }}
        onFocus={() => {
          router.prefetch(href);
        }}
        className={`group/card block cursor-pointer rounded-2xl bg-raised p-4 shadow-sm ring-1 ring-transparent transition duration-150 hover:shadow-md hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 ${
          highlighted ? 'ring-foreground' : ''
        }`}
      >
        <div className="mb-4 flex items-start gap-3 pr-8">
          <SiteCardFavicon domain={site.domain} name={site.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{site.name}</p>
            <p className="truncate text-xs text-muted-foreground">{site.domain}</p>
          </div>
        </div>
        <SiteStatusStrip status={site.status} />
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex min-w-0 items-center gap-2 text-foreground/70">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-foreground" aria-hidden="true" />
            Findings
            <span className="font-medium text-foreground">
              {site.findingsCount ?? (site.status === 'pending' ? '…' : 0)}
            </span>
          </span>
          <SiteSourceConnectionIcons
            gsc={site.connections.gsc}
            ga4={site.connections.ga4}
            ads={site.connections.ads}
          />
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
        className="absolute top-3 right-3 inline-flex h-8 w-8 pointer-coarse:h-11 pointer-coarse:w-11 items-center justify-center rounded-lg bg-raised text-muted-foreground shadow-sm transition hover:bg-danger-ink/15 hover:text-danger-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-ink/40"
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
