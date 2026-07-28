import { subDays, format } from 'date-fns';
import { runAeoAnalysis } from '@/lib/aeo/run-aeo-analysis';
import {
  computeConfidenceScore,
  countFilledIntakeFields,
  detectAuditReadiness,
} from '@/lib/audit/audit-readiness';
import { crawlWebsite } from '@/lib/crawl/site-crawler';
import {
  generateArchitectureRecommendations,
  generateFindings,
} from '@/lib/audit/finding-generators';
import { generatePromptForFinding } from '@/lib/audit/prompt-generator';
import { recommendPricing } from '@/lib/audit/pricing';
import { scoreAndSortFindings, type ScoredFinding } from '@/lib/audit/score-findings';
import { buildSiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';
import { analyzeCommercialGraph, toCommercialGraphBriefSlice } from '@/lib/graph/analyze';
import { persistCommercialGraph } from '@/lib/graph/persist';
import { buildGrowthBrief } from '@/lib/reports/build-growth-brief';
import { fetchGa4LandingPages, type Ga4LandingPageRow } from '@/lib/google/ga4';
import { getAuthorizedClient, refreshAccessToken } from '@/lib/google/oauth';
import {
  fetchSearchConsolePerformance,
  type GscPageRow,
  type GscQueryRow,
} from '@/lib/google/search-console';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  AgentPrompt,
  ArchitectureInput,
  ArchitectureRecommendation,
  AuditMetrics,
  Finding,
  PageMetric,
  PricingPlan,
  QueryMetric,
} from '@/lib/supabase/types';
import { normalizePath } from '@/lib/utils/urls';

export interface AuditRunResult {
  auditRunId: string;
  metrics: AuditMetrics;
  findings: Finding[];
  prompts: AgentPrompt[];
  pricing: PricingPlan;
  architecture: ArchitectureRecommendation[];
  pageMetrics: PageMetric[];
  queryMetrics: QueryMetric[];
}

async function getValidAccessToken(connection: {
  id: string;
  access_token: string;
  refresh_token: string | null;
  token_expiry: string | null;
}) {
  const expiry = connection.token_expiry ? new Date(connection.token_expiry).getTime() : 0;
  const isExpired = expiry > 0 && expiry < Date.now() + 60_000;

  if (!isExpired) return connection.access_token;
  if (!connection.refresh_token) return connection.access_token;

  const refreshed = await refreshAccessToken(connection.refresh_token);
  const supabase = getSupabaseAdmin();
  await supabase
    .from('google_connections')
    .update({
      access_token: refreshed.access_token,
      token_expiry: refreshed.expiry_date ? new Date(refreshed.expiry_date).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id);

  return refreshed.access_token ?? connection.access_token;
}

export async function runAudit(projectId: string, runType: 'mini' | 'full' = 'full'): Promise<AuditRunResult> {
  const supabase = getSupabaseAdmin();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .single();
  if (projectError || !project) throw new Error('Project not found.');

  const { data: website } = await supabase
    .from('websites')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  if (!website) throw new Error('Website URL is required before running an audit.');

  const { data: gscProperty } = await supabase
    .from('search_console_properties')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_selected', true)
    .maybeSingle();
  const { data: ga4Property } = await supabase
    .from('ga4_properties')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_selected', true)
    .maybeSingle();

  const needsGoogle = Boolean(gscProperty || ga4Property);
  let connection: {
    id: string;
    access_token: string;
    refresh_token: string | null;
    token_expiry: string | null;
  } | null = null;

  if (needsGoogle) {
    const connectionId = gscProperty?.connection_id ?? ga4Property?.connection_id;
    if (!connectionId) throw new Error('Google connection is missing for the selected property.');

    const { data: connectionRow } = await supabase
      .from('google_connections')
      .select('*')
      .eq('id', connectionId)
      .single();
    if (!connectionRow) throw new Error('Google connection not found.');
    connection = connectionRow;
  }

  const { data: architectureInput } = await supabase
    .from('architecture_inputs')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  const intake = (architectureInput as ArchitectureInput | null) ?? null;

  const { data: auditRun, error: runError } = await supabase
    .from('audit_runs')
    .insert({
      project_id: projectId,
      run_type: runType,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (runError || !auditRun) throw new Error(runError?.message ?? 'Failed to create audit run.');

  try {
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 28), 'yyyy-MM-dd');

    let gscData: { queryRows: GscQueryRow[]; pageRows: GscPageRow[] } = {
      queryRows: [],
      pageRows: [],
    };
    let ga4Data: Ga4LandingPageRow[] = [];

    const crawlPromise = crawlWebsite(website.url, website.crawl_max_pages);

    if (connection && (gscProperty || ga4Property)) {
      const accessToken = await getValidAccessToken(connection);
      const auth = getAuthorizedClient({
        access_token: accessToken,
        refresh_token: connection.refresh_token,
        expiry_date: connection.token_expiry ? new Date(connection.token_expiry).getTime() : null,
      });

      const [gscResult, ga4Result, crawlResult] = await Promise.all([
        gscProperty
          ? fetchSearchConsolePerformance(auth, gscProperty.site_url, startDate, endDate)
          : Promise.resolve({ queryRows: [], pageRows: [] }),
        ga4Property
          ? fetchGa4LandingPages(auth, ga4Property.property_id, startDate, endDate)
          : Promise.resolve([] as Ga4LandingPageRow[]),
        crawlPromise,
      ]);
      gscData = gscResult;
      ga4Data = ga4Result;

      return await finalizeAuditRun({
        supabase,
        auditRunId: auditRun.id,
        projectId,
        projectName: project.name,
        website,
        runType,
        intake,
        gscConnected: Boolean(gscProperty),
        ga4Connected: Boolean(ga4Property),
        gscData,
        ga4Data,
        crawlResult,
      });
    }

    const crawlResult = await crawlPromise;
    return await finalizeAuditRun({
      supabase,
      auditRunId: auditRun.id,
      projectId,
      projectName: project.name,
      website,
      runType,
      intake,
      gscConnected: false,
      ga4Connected: false,
      gscData,
      ga4Data,
      crawlResult,
    });
  } catch (error) {
    await supabase
      .from('audit_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Audit failed.',
      })
      .eq('id', auditRun.id);
    throw error;
  }
}

async function finalizeAuditRun(input: {
  supabase: ReturnType<typeof getSupabaseAdmin>;
  auditRunId: string;
  projectId: string;
  projectName: string;
  website: { id: string; url: string; crawl_max_pages: number };
  runType: 'mini' | 'full';
  intake: ArchitectureInput | null;
  gscConnected: boolean;
  ga4Connected: boolean;
  gscData: { queryRows: GscQueryRow[]; pageRows: GscPageRow[] };
  ga4Data: Ga4LandingPageRow[];
  crawlResult: Awaited<ReturnType<typeof crawlWebsite>>;
}): Promise<AuditRunResult> {
  const {
    supabase,
    auditRunId,
    projectId,
    projectName,
    website,
    runType,
    intake,
    gscConnected,
    ga4Connected,
    gscData,
    ga4Data,
    crawlResult,
  } = input;

  const draftFindings = generateFindings({
    crawledPages: crawlResult.pages,
    gscQueries: gscData.queryRows,
    gscPages: gscData.pageRows,
    ga4Pages: ga4Data,
    architectureNotes: {
      icp: intake?.icp_notes,
      product: intake?.product_notes,
      offer: intake?.offer_notes,
      proof: intake?.proof_notes,
    },
  });

  let siteOnlyAnalysis;
  try {
    siteOnlyAnalysis = await buildSiteOnlyAnalysis({
      websiteUrl: website.url,
      pages: crawlResult.pages,
      intake,
      includeGeminiInference: true,
    });
  } catch {
    siteOnlyAnalysis = await buildSiteOnlyAnalysis({
      websiteUrl: website.url,
      pages: crawlResult.pages,
      intake,
      includeGeminiInference: false,
    });
  }

  let aeoResult;
  try {
    aeoResult = await runAeoAnalysis({
      websiteUrl: website.url,
      projectName,
      intake,
      pages: crawlResult.pages,
      gscQueries: gscData.queryRows,
      gscPages: gscData.pageRows,
      ga4Pages: ga4Data,
      findings: draftFindings,
    });
  } catch (error) {
    aeoResult = {
      status: 'failed' as const,
      model: null,
      error_message: error instanceof Error ? error.message : 'AEO analysis failed.',
      analysis: null,
    };
  }

  const scoredFindings = scoreAndSortFindings(draftFindings, intake, aeoResult.analysis);
  const limitedFindings =
    runType === 'mini' ? selectTeaserFindings(scoredFindings) : scoredFindings;
  const pricing = recommendPricing(limitedFindings, runType);
  const architecture = generateArchitectureRecommendations(limitedFindings);

  const gscPageMap = new Map(gscData.pageRows.map((row) => [normalizePath(row.page), row]));
  const ga4PageMap = new Map<string, typeof ga4Data>();
  for (const row of ga4Data) {
    const path = normalizePath(row.landingPage);
    const existing = ga4PageMap.get(path) ?? [];
    existing.push(row);
    ga4PageMap.set(path, existing);
  }

  const pageMetricsPayload = crawlResult.pages.map((page) => {
    const gsc = gscPageMap.get(page.path);
    const gaRows = ga4PageMap.get(page.path) ?? [];
    const gaSessions = gaRows.reduce((sum, row) => sum + row.sessions, 0);
    const gaEngaged = gaRows.reduce((sum, row) => sum + row.engagedSessions, 0);
    const gaConversions = gaRows.reduce((sum, row) => sum + row.conversions, 0);
    const flags: string[] = [];
    if (!page.title || page.title.length < 20) flags.push('weak_title');
    if (!page.metaDescription || page.metaDescription.length < 70) flags.push('weak_meta');
    if (!page.hasFaq) flags.push('missing_faq');

    return {
      audit_run_id: auditRunId,
      path: page.path,
      url: page.url,
      title: page.title,
      meta_description: page.metaDescription,
      h1: page.h1,
      internal_link_count: page.internalLinks.length,
      has_faq: page.hasFaq,
      has_faq_schema: page.hasFaqSchema,
      gsc_clicks: gsc?.clicks ?? 0,
      gsc_impressions: gsc?.impressions ?? 0,
      gsc_ctr: gsc?.ctr ?? 0,
      gsc_position: gsc?.position ?? 0,
      ga_sessions: gaSessions,
      ga_engaged_sessions: gaEngaged,
      ga_conversions: gaConversions,
      flags,
    };
  });

  const queryMetricsPayload = gscData.queryRows.map((row) => ({
    audit_run_id: auditRunId,
    query: row.query,
    page_path: normalizePath(row.page),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
    opportunity_score:
      row.impressions * 0.001 + Math.max(0, 0.03 - row.ctr) * 100 + Math.max(0, row.position - 8) * 2,
  }));

  const totalClicks = gscData.pageRows.reduce((sum, row) => sum + row.clicks, 0);
  const totalImpressions = gscData.pageRows.reduce((sum, row) => sum + row.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition =
    gscData.pageRows.length > 0
      ? gscData.pageRows.reduce((sum, row) => sum + row.position, 0) / gscData.pageRows.length
      : 0;
  const totalSessions = ga4Data.reduce((sum, row) => sum + row.sessions, 0);
  const totalEngaged = ga4Data.reduce((sum, row) => sum + row.engagedSessions, 0);
  const totalConversions = ga4Data.reduce((sum, row) => sum + row.conversions, 0);
  const highSeverityCount = limitedFindings.filter(
    (finding) => finding.severity === 'high' || finding.severity === 'critical'
  ).length;

  const intakeCounts = countFilledIntakeFields(intake as unknown as Record<string, unknown> | null);
  const { readiness, dataAvailability } = detectAuditReadiness({
    gscConnected,
    ga4Connected,
    gscImpressions: totalImpressions,
    ga4Sessions: totalSessions,
    hasCrawl: crawlResult.pages.length > 0,
    hasIntake: intakeCounts.filled > 0,
    hasGemini: aeoResult.status === 'completed' || siteOnlyAnalysis.inferred?.status === 'completed',
  });

  const confidenceScore = computeConfidenceScore({
    readiness,
    pagesCrawled: crawlResult.pages.length,
    intakeFieldCount: intakeCounts.filled,
    intakeFieldTotal: intakeCounts.total,
    aeoCompleted: aeoResult.status === 'completed',
    findingsCount: limitedFindings.length,
  });

  const { data: metrics } = await supabase
    .from('audit_metrics')
    .insert({
      audit_run_id: auditRunId,
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      avg_ctr: avgCtr,
      avg_position: avgPosition,
      total_sessions: totalSessions,
      total_engaged_sessions: totalEngaged,
      total_conversions: totalConversions,
      pages_crawled: crawlResult.pages.length,
      findings_count: limitedFindings.length,
      high_severity_count: highSeverityCount,
    })
    .select('*')
    .single();

  const { data: pageMetrics } =
    pageMetricsPayload.length > 0
      ? await supabase.from('page_metrics').insert(pageMetricsPayload).select('*')
      : { data: [] as PageMetric[] };

  const { data: queryMetrics } =
    queryMetricsPayload.length > 0
      ? await supabase.from('query_metrics').insert(queryMetricsPayload).select('*')
      : { data: [] as QueryMetric[] };

  const findingsPayload = limitedFindings.map((finding) => ({
    audit_run_id: auditRunId,
    project_id: projectId,
    type: finding.type,
    category: finding.category,
    severity: finding.severity,
    title: finding.title,
    summary: finding.summary,
    page_path: finding.page_path,
    evidence: finding.evidence,
    buyer_moment: finding.buyer_moment,
    estimated_value: finding.estimated_value,
    revenue_impact: finding.revenue_impact,
    buyer_importance: finding.buyer_importance,
    urgency: finding.urgency,
    execution_difficulty: finding.execution_difficulty,
    confidence: finding.confidence,
    aeo_value: finding.aeo_value,
    priority_score: finding.priority_score,
    status: 'open',
  }));

  const { data: findings } =
    findingsPayload.length > 0
      ? await supabase.from('findings').insert(findingsPayload).select('*')
      : { data: [] as Finding[] };

  const promptsPayload = (findings ?? []).map((finding) => {
    const prompt = generatePromptForFinding(
      {
        type: finding.type,
        category: finding.category,
        severity: finding.severity,
        title: finding.title,
        summary: finding.summary,
        page_path: finding.page_path,
        evidence: finding.evidence as Record<string, unknown>,
        buyer_moment: finding.buyer_moment ?? 'Evaluation',
        estimated_value: finding.estimated_value ?? 'Improved performance',
      },
      projectName,
      website.url
    );
    return {
      finding_id: finding.id,
      audit_run_id: auditRunId,
      ...prompt,
    };
  });

  const { data: prompts } =
    promptsPayload.length > 0
      ? await supabase.from('agent_prompts').insert(promptsPayload).select('*')
      : { data: [] as AgentPrompt[] };

  const { data: pricingPlan } = await supabase
    .from('pricing_plans')
    .insert({
      audit_run_id: auditRunId,
      project_id: projectId,
      recommended_tier: pricing.recommended_tier,
      price_range: pricing.price_range,
      rationale: pricing.rationale,
      included_items: pricing.included_items,
    })
    .select('*')
    .single();

  const { data: architectureRows } =
    architecture.length > 0
      ? await supabase
          .from('architecture_recommendations')
          .insert(
            architecture.map((item) => ({
              audit_run_id: auditRunId,
              project_id: projectId,
              page_type: item.page_type,
              title: item.title,
              rationale: item.rationale,
              priority: item.priority,
              suggested_path: item.suggested_path,
            }))
          )
          .select('*')
      : { data: [] as ArchitectureRecommendation[] };

  const { data: aeoRow } = await supabase
    .from('aeo_analyses')
    .insert({
      audit_run_id: auditRunId,
      project_id: projectId,
      status: aeoResult.status,
      model: aeoResult.model,
      error_message: aeoResult.error_message,
      analysis: aeoResult.analysis,
    })
    .select('*')
    .single();

  const graphArtifact = analyzeCommercialGraph({
    projectName,
    websiteUrl: website.url,
    pages: crawlResult.pages,
    intake,
    aeo: aeoResult.analysis,
    siteOnly: siteOnlyAnalysis,
    queries: (queryMetrics ?? []).map((row) => ({
      query: row.query,
      impressions: row.impressions,
      clicks: row.clicks,
      page_path: row.page_path,
    })),
    ga4Landings: Array.from(ga4PageMap.entries()).map(([path, rows]) => ({
      path,
      sessions: rows.reduce((sum, row) => sum + row.sessions, 0),
    })),
  });

  try {
    await persistCommercialGraph({
      supabase,
      projectId,
      auditRunId,
      artifact: graphArtifact,
    });
  } catch (graphPersistError) {
    console.error('Commercial graph persist failed', graphPersistError);
  }

  const commercialGraph = toCommercialGraphBriefSlice(graphArtifact);

  const growthBrief = buildGrowthBrief({
    runType,
    projectName,
    websiteUrl: website.url,
    intake,
    findings: limitedFindings,
    metrics: metrics
      ? {
          total_clicks: metrics.total_clicks,
          total_impressions: metrics.total_impressions,
          avg_ctr: metrics.avg_ctr,
          avg_position: metrics.avg_position,
          total_sessions: metrics.total_sessions,
          total_engaged_sessions: metrics.total_engaged_sessions,
          total_conversions: metrics.total_conversions,
          pages_crawled: metrics.pages_crawled,
          findings_count: metrics.findings_count,
          high_severity_count: metrics.high_severity_count,
        }
      : null,
    queryMetrics: (queryMetrics ?? []).map((row) => ({
      query: row.query,
      impressions: row.impressions,
      clicks: row.clicks,
      opportunity_score: row.opportunity_score,
    })),
    aeoResult,
    pricing,
    readiness,
    dataAvailability,
    siteOnlyAnalysis,
    confidenceScore,
    commercialGraph,
  });

  const reportType = growthBrief.reportType;
  const reportTitle =
    reportType === 'teaser' ? `${projectName} Site audit` : `${projectName} Full audit`;

  const reportSnapshot = {
    project: { id: projectId, name: projectName },
    website,
    metrics,
    findings,
    prompts,
    pricing: pricingPlan,
    architecture: architectureRows,
    pageMetrics,
    queryMetrics,
    aeo: aeoRow,
    growthBrief,
    commercialGraph,
    reportType,
    readiness,
    dataAvailability,
    siteOnlyAnalysis,
    confidenceScore,
    crawlErrors: crawlResult.errors,
    generatedAt: new Date().toISOString(),
  };

  await supabase.from('report_exports').insert({
    audit_run_id: auditRunId,
    project_id: projectId,
    title: reportTitle,
    report_type: reportType,
    snapshot: reportSnapshot,
  });

  await supabase
    .from('audit_runs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      audit_readiness: readiness,
      data_availability: dataAvailability,
      site_only_analysis: siteOnlyAnalysis,
      confidence_score: confidenceScore,
    })
    .eq('id', auditRunId);

  return {
    auditRunId,
    metrics: metrics!,
    findings: findings ?? [],
    prompts: prompts ?? [],
    pricing: pricingPlan!,
    architecture: architectureRows ?? [],
    pageMetrics: pageMetrics ?? [],
    queryMetrics: queryMetrics ?? [],
  };
}

function selectTeaserFindings(scored: ScoredFinding[]): ScoredFinding[] {
  const selected: ScoredFinding[] = [];
  const leak =
    scored.find((f) => f.category === 'search' || f.category === 'conversion') ??
    scored.find((f) => f.category === 'on_page') ??
    scored[0];
  const architecture = scored.find((f) => f.category === 'architecture');
  if (leak) selected.push(leak);
  if (architecture && architecture !== leak) selected.push(architecture);
  for (const finding of scored) {
    if (selected.length >= 3) break;
    if (!selected.includes(finding)) selected.push(finding);
  }
  return selected.length > 0 ? selected : scored.slice(0, 3);
}
