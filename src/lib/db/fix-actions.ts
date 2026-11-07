import {
  buildBaseline,
  compareFix,
  siteTotals,
  snapshotTarget,
  type FixBaseline,
  type FixProof,
  type FixTargetKind,
} from '@/lib/audit/fix-proof';
import type { ValueSettings } from '@/lib/audit/opportunity';
import { loadDashboardMetricsForProject } from '@/lib/db/connected-metrics';
import { logError } from '@/lib/monitoring/log-error';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export type FixActionView = {
  issueId: string;
  target: string;
  targetKind: FixTargetKind;
  title: string;
  doneAt: string;
  /** Null until a later audit has run long enough after the fix. */
  proof: FixProof | null;
};

type FixActionRow = {
  issue_id: string;
  target: string;
  target_kind: FixTargetKind;
  title: string;
  baseline: FixBaseline;
  baseline_audit_run_id: string | null;
  done_at: string;
};

export class FixTargetMissingError extends Error {
  constructor() {
    super('That page or query isn’t in the latest audit data, so its starting numbers can’t be saved.');
  }
}

/** Done fixes for a project, each compared against the latest completed audit when one exists. */
export async function listFixActions(projectId: string): Promise<FixActionView[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('fix_actions')
    .select('issue_id, target, target_kind, title, baseline, baseline_audit_run_id, done_at')
    .eq('project_id', projectId)
    .eq('status', 'done')
    .order('done_at', { ascending: false });
  if (error) {
    logError('fix-actions.list', error, { projectId });
    return [];
  }
  const rows = (data ?? []) as FixActionRow[];
  if (rows.length === 0) return [];

  const dash = await loadDashboardMetricsForProject(projectId);
  const { data: run } = dash.auditRunId
    ? await supabase.from('audit_runs').select('completed_at').eq('id', dash.auditRunId).maybeSingle()
    : { data: null };
  const runCompletedAt = run?.completed_at ? new Date(run.completed_at as string) : null;

  return rows.map((row) => {
    const doneAt = new Date(row.done_at);
    // Only a different, later audit can show what the fix did.
    const canCompare =
      runCompletedAt !== null &&
      dash.auditRunId !== row.baseline_audit_run_id &&
      runCompletedAt > doneAt;
    const proof = canCompare
      ? compareFix({
          issueId: row.issue_id,
          baseline: row.baseline,
          after: snapshotTarget(dash.connected, row.target_kind, row.target),
          siteAfter: siteTotals(dash.connected),
          doneAt,
          runCompletedAt,
        })
      : null;
    return {
      issueId: row.issue_id,
      target: row.target,
      targetKind: row.target_kind,
      title: row.title,
      doneAt: row.done_at,
      proof,
    };
  });
}

/** Mark a fix done and freeze its starting numbers from the latest audit. Idempotent: re-marking keeps the original baseline. */
export async function markFixDone(
  projectId: string,
  input: { issueId: string; target: string; targetKind: FixTargetKind; title: string }
) {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from('fix_actions')
    .select('id')
    .eq('project_id', projectId)
    .eq('issue_id', input.issueId)
    .eq('target', input.target)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from('fix_actions')
      .update({ status: 'done' })
      .eq('id', existing.id as string);
    if (error) {
      logError('fix-actions.mark-done', error, { projectId });
      throw new Error('Could not save this fix.');
    }
    return;
  }

  const dash = await loadDashboardMetricsForProject(projectId);
  const baseline = buildBaseline(dash.connected, input.targetKind, input.target);
  if (!baseline) throw new FixTargetMissingError();

  const { error } = await supabase.from('fix_actions').insert({
    project_id: projectId,
    issue_id: input.issueId,
    target: input.target,
    target_kind: input.targetKind,
    title: input.title,
    status: 'done',
    baseline,
    baseline_audit_run_id: dash.auditRunId,
  });
  if (error) {
    logError('fix-actions.mark-done', error, { projectId });
    throw new Error('Could not save this fix.');
  }
}

export async function reopenFix(projectId: string, issueId: string, target: string) {
  const { error } = await getSupabaseAdmin()
    .from('fix_actions')
    .delete()
    .eq('project_id', projectId)
    .eq('issue_id', issueId)
    .eq('target', target);
  if (error) {
    logError('fix-actions.reopen', error, { projectId });
    throw new Error('Could not reopen this fix.');
  }
}

export async function loadValueSettings(projectId: string): Promise<ValueSettings> {
  const { data, error } = await getSupabaseAdmin()
    .from('project_value_settings')
    .select('value_per_conversion, currency')
    .eq('project_id', projectId)
    .maybeSingle();
  if (error) {
    logError('fix-actions.load-value', error, { projectId });
    return null;
  }
  if (!data) return null;
  return {
    valuePerConversion: Number(data.value_per_conversion),
    currency: (data.currency as string) || 'USD',
  };
}

export async function saveValueSettings(projectId: string, settings: ValueSettings) {
  const supabase = getSupabaseAdmin();
  const { error } = settings
    ? await supabase.from('project_value_settings').upsert(
        {
          project_id: projectId,
          value_per_conversion: settings.valuePerConversion,
          currency: settings.currency,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' }
      )
    : await supabase.from('project_value_settings').delete().eq('project_id', projectId);
  if (error) {
    logError('fix-actions.save-value', error, { projectId });
    throw new Error('Could not save the conversion value.');
  }
}
