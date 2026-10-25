import type { AeoCheck, AeoPageKind, AeoPageSignals } from '@/lib/aeo/page-scanner';
import type { TopicMap } from '@/lib/aeo/topic-map';
import type { ProbeResult } from '@/lib/aeo/citation-probe';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import { logError } from '@/lib/monitoring/log-error';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface AeoPageScanRow {
  path: string;
  kind: AeoPageKind;
  score: number;
  checks: AeoCheck[];
  signals: AeoPageSignals;
  /** Absent on scans saved before titles were stored. */
  title?: string | null;
  h1?: string | null;
}

/**
 * Best-effort: a failed insert must never fail the audit, so errors are logged
 * and swallowed (this also covers the table not existing before the migration).
 */
export async function persistAeoPageScans(
  auditRunId: string,
  projectId: string,
  pages: CrawledPage[]
) {
  const rows = pages.flatMap((page) =>
    page.aeo
      ? [
          {
            audit_run_id: auditRunId,
            project_id: projectId,
            path: page.aeo.path,
            kind: page.aeo.kind,
            score: page.aeo.score,
            checks: page.aeo.checks,
            signals: page.aeo.signals,
            title: page.title,
            h1: page.h1,
          },
        ]
      : []
  );
  if (rows.length === 0) return;

  const supabase = getSupabaseAdmin();
  let { error } = await supabase.from('aeo_page_scans').insert(rows);
  if (error) {
    // The title/h1 columns arrive in a later migration; keep scans saving without them.
    const bare = rows.map((row) => ({
      audit_run_id: row.audit_run_id,
      project_id: row.project_id,
      path: row.path,
      kind: row.kind,
      score: row.score,
      checks: row.checks,
      signals: row.signals,
    }));
    ({ error } = await supabase.from('aeo_page_scans').insert(bare));
  }
  if (error) logError('aeo.persist-page-scans', error, { projectId, auditRunId });
}

export async function loadAeoAnalysis(auditRunId: string): Promise<AeoAnalysis | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('aeo_analyses')
    .select('status, analysis')
    .eq('audit_run_id', auditRunId)
    .maybeSingle();
  if (error) {
    logError('aeo.load-analysis', error, { auditRunId });
    return null;
  }
  return data?.status === 'completed' ? ((data.analysis as AeoAnalysis | null) ?? null) : null;
}

export async function loadAeoPageScans(auditRunId: string): Promise<AeoPageScanRow[]> {
  const supabase = getSupabaseAdmin();
  const query = (columns: string) =>
    supabase.from('aeo_page_scans').select(columns).eq('audit_run_id', auditRunId).order('score', { ascending: true });
  let { data, error } = await query('path, kind, score, checks, signals, title, h1');
  if (error) {
    // Databases without the title/h1 migration still return their scans.
    ({ data, error } = await query('path, kind, score, checks, signals'));
  }
  if (error) {
    logError('aeo.load-page-scans', error, { auditRunId });
    return [];
  }
  return (data ?? []) as unknown as AeoPageScanRow[];
}

export interface CitationProbeRun {
  probeRunId: string;
  createdAt: string;
  results: ProbeResult[];
}

export async function persistCitationProbes(
  projectId: string,
  probeRunId: string,
  results: ProbeResult[]
) {
  const rows = results.map((r) => ({
    project_id: projectId,
    probe_run_id: probeRunId,
    prompt: r.prompt,
    cited: r.cited,
    mentioned: r.mentioned,
    sources: r.sources,
    error: r.error,
  }));
  const { error } = await getSupabaseAdmin().from('aeo_citation_probes').insert(rows);
  if (error) {
    logError('aeo.persist-citation-probes', error, { projectId, probeRunId });
    throw new Error('Could not save probe results.');
  }
}

/** Newest probe run for a project, or null if none (or the table is missing). */
export async function loadLatestCitationProbe(projectId: string): Promise<CitationProbeRun | null> {
  const supabase = getSupabaseAdmin();
  const { data: latest, error: latestError } = await supabase
    .from('aeo_citation_probes')
    .select('probe_run_id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) {
    logError('aeo.load-citation-probe', latestError, { projectId });
    return null;
  }
  if (!latest) return null;

  const { data, error } = await supabase
    .from('aeo_citation_probes')
    .select('prompt, cited, mentioned, sources, error, created_at')
    .eq('probe_run_id', latest.probe_run_id)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error || !data?.length) {
    if (error) logError('aeo.load-citation-probe', error, { projectId });
    return null;
  }
  return {
    probeRunId: latest.probe_run_id as string,
    createdAt: data[0].created_at as string,
    results: data.map((row) => ({
      prompt: row.prompt as string,
      cited: row.cited as boolean,
      mentioned: row.mentioned as boolean,
      sources: (row.sources ?? []) as ProbeResult['sources'],
      error: (row.error as string | null) ?? null,
    })),
  };
}

/** Probe runs started for a project in the last 24h, plus when the newest began. */
export async function countRecentProbeRuns(projectId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from('aeo_citation_probes')
    .select('probe_run_id, created_at')
    .eq('project_id', projectId)
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  if (error) {
    logError('aeo.count-probe-runs', error, { projectId });
    // Fail closed: if usage can't be verified, don't let the caller spend.
    throw new Error('Could not verify probe usage. Please try again.');
  }
  const runs = new Set((data ?? []).map((r) => r.probe_run_id as string));
  const newest = data?.[0]?.created_at ? new Date(data[0].created_at as string).getTime() : null;
  return { runs: runs.size, newestAt: newest };
}

export async function loadTopicMap(auditRunId: string): Promise<TopicMap | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('aeo_topic_maps')
    .select('map')
    .eq('audit_run_id', auditRunId)
    .maybeSingle();
  if (error) {
    logError('aeo.load-topic-map', error, { auditRunId });
    return null;
  }
  return (data?.map as TopicMap | null) ?? null;
}

export async function loadTopicMapCreatedAt(auditRunId: string): Promise<number | null> {
  const { data } = await getSupabaseAdmin()
    .from('aeo_topic_maps')
    .select('created_at')
    .eq('audit_run_id', auditRunId)
    .maybeSingle();
  return data?.created_at ? new Date(data.created_at as string).getTime() : null;
}

export async function saveTopicMap(
  auditRunId: string,
  projectId: string,
  model: string,
  map: TopicMap
) {
  const { error } = await getSupabaseAdmin()
    .from('aeo_topic_maps')
    .upsert(
      { audit_run_id: auditRunId, project_id: projectId, model, map, created_at: new Date().toISOString() },
      { onConflict: 'audit_run_id' }
    );
  if (error) {
    logError('aeo.save-topic-map', error, { projectId, auditRunId });
    throw new Error('Could not save the topic map.');
  }
}
