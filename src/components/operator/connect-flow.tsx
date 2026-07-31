'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, Link2 } from 'lucide-react';
import { useInvalidateAuditTab } from '@/components/audit/audit-tab-cache';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Ga4Property, SearchConsoleProperty } from '@/lib/supabase/types';

export function ConnectFlow({
  projectId,
  googleConnected,
  gscProperties,
  ga4Properties,
  operatorEmail,
  fullBriefUnlocked,
  paidPlan = true,
  workspaceBase,
}: {
  projectId: string;
  googleConnected: boolean;
  gscProperties: SearchConsoleProperty[];
  ga4Properties: Ga4Property[];
  operatorEmail?: string | null;
  fullBriefUnlocked: boolean;
  paidPlan?: boolean;
  /** Base path for in-app links, e.g. `/audit/{sessionOrProjectId}`. */
  workspaceBase?: string;
}) {
  const base = workspaceBase ?? `/audit/${projectId}`;
  const router = useRouter();
  const invalidateTab = useInvalidateAuditTab();
  const [selectedGsc, setSelectedGsc] = useState(
    gscProperties.find((property) => property.is_selected)?.id ?? ''
  );
  const [selectedGa4, setSelectedGa4] = useState(
    ga4Properties.find((property) => property.is_selected)?.id ?? ''
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    invalidateTab('/connect');
    invalidateTab('');
    invalidateTab('/journey');
    router.refresh();

    if (gscCount === 0 && ga4Count === 0) {
      setMessage(
        'Synced, but Google returned 0 Search Console sites and 0 GA4 properties for this account. Confirm the operator Google account has access in Search Console and GA4, then sync again.'
      );
      return;
    }

    setMessage(`Synced ${gscCount} Search Console and ${ga4Count} GA4 properties.`);
  }

  async function saveMapping() {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/projects/${projectId}/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gscPropertyId: selectedGsc, ga4PropertyId: selectedGa4 }),
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
    setMessage('Property mapping saved.');
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {!paidPlan ? (
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Paid plan required</CardTitle>
            <CardDescription>
              Free accounts can run crawl-only audits. Upgrade to paid to unlock Search Console and
              GA4 connections for this project.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button render={<a href="/#pricing" />}>View pricing</Button>
          </CardFooter>
        </Card>
      ) : null}

      {!fullBriefUnlocked && paidPlan ? (
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Full audit access required</CardTitle>
            <CardDescription>
              Connect Search Console and GA4 after unlocking full audit access (~$700). Data
              connections unlock search and engagement evidence in the report.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button render={<a href={base} />}>Open report to unlock</Button>
          </CardFooter>
        </Card>
      ) : null}

      {fullBriefUnlocked && paidPlan ? (
        <>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-4" />
            Google account
          </CardTitle>
          <CardDescription>
            Connect Search Console and GA4 readonly access for the operator account.
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
            <Button variant="outline" render={<a href={`/api/google/oauth/start?projectId=${projectId}`} />}>
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
              Optional: map GSC and/or GA4 for richer audits. Site-only audits work with just the website URL.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={syncProperties} disabled={!googleConnected || loading}>
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
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <Button onClick={saveMapping} disabled={!googleConnected || loading}>
            Save mapping
          </Button>
          <p className="text-xs text-muted-foreground">
            Leave either side blank for GSC-only, GA4-only, or clear both for site-only mode.
          </p>
        </CardFooter>
      </Card>
        </>
      ) : null}
    </div>
  );
}
