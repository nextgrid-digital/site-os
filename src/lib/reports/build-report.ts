import type {
  AgentPrompt,
  ArchitectureRecommendation,
  AuditMetrics,
  AuditRun,
  Finding,
  PricingPlan,
  Project,
  QueryMetric,
  ReportExport,
  Website,
} from '@/lib/supabase/types';

export interface ReportSnapshot {
  project: Pick<Project, 'id' | 'name'>;
  website: Website;
  auditRun: AuditRun;
  metrics: AuditMetrics;
  findings: Finding[];
  prompts: AgentPrompt[];
  pricing: PricingPlan | null;
  architecture: ArchitectureRecommendation[];
  queryMetrics: QueryMetric[];
  generatedAt: string;
}

export function buildReportSnapshot(input: ReportSnapshot) {
  return {
    title: `${input.project.name} audit report`,
    generatedAt: input.generatedAt,
    summary: {
      clicks: input.metrics.total_clicks,
      impressions: input.metrics.total_impressions,
      ctr: input.metrics.avg_ctr,
      position: input.metrics.avg_position,
      sessions: input.metrics.total_sessions,
      engagedSessions: input.metrics.total_engaged_sessions,
      conversions: input.metrics.total_conversions,
      pagesCrawled: input.metrics.pages_crawled,
      findingsCount: input.metrics.findings_count,
      highSeverityCount: input.metrics.high_severity_count,
    },
    charts: {
      topQueries: input.queryMetrics
        .toSorted((a, b) => b.opportunity_score - a.opportunity_score)
        .slice(0, 10)
        .map((row) => ({
          label: row.query,
          impressions: row.impressions,
          clicks: row.clicks,
          ctr: row.ctr,
          position: row.position,
        })),
      severityBreakdown: ['critical', 'high', 'medium', 'low'].map((severity) => ({
        severity,
        count: input.findings.filter((finding) => finding.severity === severity).length,
      })),
    },
    opportunityQueue: input.findings
      .filter((finding) => finding.severity === 'high' || finding.severity === 'critical')
      .map((finding) => ({
        id: finding.id,
        title: finding.title,
        pagePath: finding.page_path,
        category: finding.category,
        severity: finding.severity,
      })),
    architectureGaps: input.architecture,
    pricing: input.pricing,
    findings: input.findings,
    prompts: input.prompts,
  };
}

export function reportFromExport(exportRow: ReportExport) {
  return exportRow.snapshot;
}
