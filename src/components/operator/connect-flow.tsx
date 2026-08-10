'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, Link2 } from 'lucide-react';
import { useInvalidateAuditTab } from '@/components/audit/audit-tab-cache';
import { ConnectorSourceCards } from '@/components/audit/connectors/connector-source-cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { ConnectorStatus } from '@/lib/connectors/types';
import type { Ga4Property, GoogleAdsAccount, SearchConsoleProperty } from '@/lib/supabase/types';

export function ConnectFlow({
  projectId,
  googleConnected,
  gscProperties,
  ga4Properties,
  adsAccounts = [],
  connectorStatuses = [],
  operatorEmail,
  workspaceBase,
}: {
  projectId: string;
  googleConnected: boolean;
  gscProperties: SearchConsoleProperty[];
  ga4Properties: Ga4Property[];
  adsAccounts?: GoogleAdsAccount[];
  connectorStatuses?: ConnectorStatus[];
  operatorEmail?: string | null;
  /** @deprecated Ignored — Site-OS is fully free. */
  fullBriefUnlocked?: boolean;
  /** @deprecated Ignored — Site-OS is fully free. */
  paidPlan?: boolean;
  workspaceBase?: string;
}) {
  const router = useRouter();
  const invalidateTab = useInvalidateAuditTab();
  const [selectedGsc, setSelectedGsc] = useState(
    gscProperties.find((property) => property.is_selected)?.id ?? ''
  );
  const [selectedGa4, setSelectedGa4] = useState(
    ga4Properties.find((property) => property.is_selected)?.id ?? ''
  );
  const [selectedAds, setSelectedAds] = useState(
    adsAccounts.find((account) => account.is_selected)?.id ?? ''
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mappingSaved, setMappingSaved] = useState(false);
  const reportHref = workspaceBase ? `${workspaceBase}/journey` : `/audit/${projectId}/journey`;
  const connectHref = workspaceBase ? `${workspaceBase}/connect` : `/audit/${projectId}/connect`;

  async function syncProperties() {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/projects/${projectId}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync' }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? 'Failed to sync properties.');
      return;
    }

    const gscCount = data.properties?.gsc?.length ?? 0;
    const ga4Count = data.properties?.ga4?.length ?? 0;
    const adsCount = data.properties?.ads?.length ?? 0;
    invalidateTab('/connect');
    invalidateTab('');
    invalidateTab('/journey');
    router.refresh();

    if (gscCount === 0 && ga4Count === 0 && adsCount === 0) {
      setMessage(
        'Synced, but Google returned 0 Search Console sites, 0 GA4 properties, and 0 Ads accounts. Confirm access, then sync again.'
      );
      return;
    }

    setMessage(
      `Synced ${gscCount} Search Console, ${ga4Count} GA4, and ${adsCount} Ads account(s).`
    );
  }

  async function saveMapping() {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/projects/${projectId}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gscPropertyId: selectedGsc,
        ga4PropertyId: selectedGa4,
        adsAccountId: selectedAds,
      }),
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error ?? 'Failed to save mapping.');
      return;
    }
    invalidateTab('/connect');
    invalidateTab('');
    invalidateTab('/journey');
    router.refresh();
    setMappingSaved(true);
    setMessage('Property mapping saved.');
  }

  return (
    <div className="space-y-6">
      {mappingSaved || googleConnected ? (
        <div className="flex flex-wrap gap-2">
          <Button render={<a href={reportHref} />}>View Brand dashboard</Button>
          <Button variant="outline" render={<a href="/app" />}>
            Your sites
          </Button>
        </div>
      ) : null}

      {connectorStatuses.length > 0 ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-950">Sources</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Connection status for each channel. Phase 2–3 sources stay empty until they ship.
            </p>
          </div>
          <ConnectorSourceCards statuses={connectorStatuses} connectHref={connectHref} />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="size-4" />
              Google account
            </CardTitle>
            <CardDescription>
              Connect Search Console, GA4, and Ads readonly access for the operator account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {googleConnected ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="size-4" />
                Connected{operatorEmail ? ` as ${operatorEmail}` : ' for this workspace'}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Google is not connected yet for this workspace.
              </p>
            )}
          </CardContent>
          <CardFooter>
            {googleConnected ? (
              <Button
                variant="outline"
                render={<a href={`/api/google/oauth/start?projectId=${projectId}`} />}
              >
                Reconnect Google
              </Button>
            ) : (
              <Button render={<a href={`/api/google/oauth/start?projectId=${projectId}`} />}>
                Connect Google
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Property mapping</CardTitle>
              <CardDescription>
                Map one GSC property, one GA4 property, and one Ads account. Website is always the
                base source.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={syncProperties}
              disabled={!googleConnected || loading}
            >
              Sync
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gsc">Search Console ({gscProperties.length})</Label>
              <select
                id="gsc"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                value={selectedGsc}
                onChange={(event) => setSelectedGsc(event.target.value)}
              >
                <option value="">
                  {gscProperties.length === 0 ? 'No sites found' : 'Select property'}
                </option>
                {gscProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.site_url}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ga4">GA4 ({ga4Properties.length})</Label>
              <select
                id="ga4"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                value={selectedGa4}
                onChange={(event) => setSelectedGa4(event.target.value)}
              >
                <option value="">
                  {ga4Properties.length === 0 ? 'No properties found' : 'Select property'}
                </option>
                {ga4Properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.property_name} ({property.account_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ads">Google Ads ({adsAccounts.length})</Label>
              <select
                id="ads"
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                value={selectedAds}
                onChange={(event) => setSelectedAds(event.target.value)}
              >
                <option value="">
                  {adsAccounts.length === 0 ? 'No accounts found' : 'Select account'}
                </option>
                {adsAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.descriptive_name} ({account.customer_id})
                  </option>
                ))}
              </select>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button onClick={saveMapping} disabled={!googleConnected || loading}>
              Save mapping
            </Button>
            <p className="text-xs text-muted-foreground">
              Leave any side blank for partial mapping, or clear all for site-only mode.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
