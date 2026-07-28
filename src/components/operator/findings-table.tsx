import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { findingCategoryLabel } from '@/lib/reports/presale-labels';
import type { Finding } from '@/lib/supabase/types';

function severityClass(severity: Finding['severity']) {
  if (severity === 'critical') return 'bg-destructive text-white border-transparent';
  if (severity === 'high') return 'bg-priority text-priority-foreground border-transparent';
  if (severity === 'medium') return 'bg-aeo/80 text-aeo-foreground border-transparent';
  return '';
}

function severityVariant(severity: Finding['severity']) {
  if (severity === 'critical' || severity === 'high') return 'destructive';
  if (severity === 'medium') return 'secondary';
  return 'outline';
}

export function FindingsTable({
  projectId,
  findings,
}: {
  projectId: string;
  findings: Finding[];
}) {
  if (findings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No findings yet. Run an audit to generate lead blockers.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Finding</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Page</TableHead>
          <TableHead className="text-right">Open</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {findings.map((finding) => (
          <TableRow key={finding.id}>
            <TableCell>
              <div>
                <p className="font-medium">{finding.title}</p>
                <p className="text-xs text-muted-foreground">{finding.summary}</p>
              </div>
            </TableCell>
            <TableCell>{findingCategoryLabel(finding.category, finding.type)}</TableCell>
            <TableCell>
              <Badge
                variant={severityVariant(finding.severity)}
                className={severityClass(finding.severity)}
              >
                {finding.severity}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs">{finding.page_path ?? '—'}</TableCell>
            <TableCell className="text-right">
              <Link
                href={`/operator/projects/${projectId}/findings/${finding.id}`}
                className="text-sm underline-offset-4 hover:underline"
              >
                Open
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
