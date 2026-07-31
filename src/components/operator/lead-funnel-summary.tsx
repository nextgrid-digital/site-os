import Link from 'next/link';
import { OperatorCard } from '@/components/operator/operator-card';
import { StatCard } from '@/components/operator/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { leadStageLabel, leadStatusLabel } from '@/lib/leads';
import type { ProjectLeadReportingSummary } from '@/lib/supabase/types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function LeadFunnelSummary({
  projectId,
  reporting,
  title = 'Lead funnel',
  description = 'Traffic, lead gain, and current funnel coverage.',
  showManageButton = false,
  leadsHref,
}: {
  projectId: string;
  reporting: ProjectLeadReportingSummary;
  title?: string;
  description?: string;
  showManageButton?: boolean;
  leadsHref?: string;
}) {
  const manageHref = leadsHref ?? `/audit/${projectId}/leads`;
  const topTraffic = reporting.trafficByChannel.slice(0, 6);

  return (
    <div className="space-y-4">
      <OperatorCard className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">GA4 traffic: last 28 days</Badge>
            {showManageButton ? (
              <Button size="sm" variant="outline" render={<Link href={manageHref} />}>
                Manage leads
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total leads" value={reporting.leadSummary.totalLeads} hint="App-owned pipeline" />
          <StatCard label="Open leads" value={reporting.leadSummary.openLeads} hint="Not closed yet" tone="primary" />
          <StatCard label="Closed leads" value={reporting.leadSummary.closedLeads} hint="Status = closed" tone="success" />
          <StatCard
            label="Pipeline value"
            value={formatCurrency(reporting.leadSummary.totalValue)}
            hint="Manual expected value"
          />
        </div>
      </OperatorCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <OperatorCard>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-medium text-foreground">Channel-wise distribution</p>
            <span className="text-xs text-muted-foreground">Sessions by channel</span>
          </div>
          {topTraffic.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Engaged</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTraffic.map((row) => (
                  <TableRow key={row.channel}>
                    <TableCell className="font-medium">{row.channel}</TableCell>
                    <TableCell className="text-right">{row.sessions}</TableCell>
                    <TableCell className="text-right">{row.engagedSessions}</TableCell>
                    <TableCell className="text-right">{row.conversions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No live GA4 traffic summary yet. Connect a GA4 property to populate channel distribution.
            </p>
          )}
        </OperatorCard>

        <OperatorCard>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-medium text-foreground">Channel-wise lead gain</p>
            <span className="text-xs text-muted-foreground">Grouped by lead attribution</span>
          </div>
          {reporting.leadSummary.byChannel.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  <TableHead className="text-right">Closed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reporting.leadSummary.byChannel.map((row) => (
                  <TableRow key={row.channel}>
                    <TableCell className="font-medium">{row.channel}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{row.openCount}</TableCell>
                    <TableCell className="text-right">{row.closedCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No leads yet. Add leads to start tracking channel-wise gain and funnel progression.
            </p>
          )}
        </OperatorCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OperatorCard>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-medium text-foreground">Funnel stage</p>
            <span className="text-xs text-muted-foreground">Current pipeline stage</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {reporting.leadSummary.byStage.map((row) => (
              <Badge key={row.stage} variant="secondary">
                {leadStageLabel(row.stage)}: {row.count}
              </Badge>
            ))}
          </div>
        </OperatorCard>

        <OperatorCard>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-medium text-foreground">Lead status</p>
            <span className="text-xs text-muted-foreground">Current execution status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {reporting.leadSummary.byStatus.map((row) => (
              <Badge key={row.status} variant="outline">
                {leadStatusLabel(row.status)}: {row.count}
              </Badge>
            ))}
          </div>
        </OperatorCard>
      </div>
    </div>
  );
}
