import { getSupabaseAdmin } from '@/lib/supabase/server';

/** Thrown inside a running audit when its site was deleted (or the run was otherwise stopped). */
export class AuditCancelledError extends Error {
  constructor() {
    super('Audit cancelled: the site was deleted.');
    this.name = 'AuditCancelledError';
  }
}

/**
 * Deleting a project cascades its audit_runs rows away, so a run that is no
 * longer present (or no longer 'running') has been cancelled. Background audits
 * call this between expensive steps so they stop spending crawl and AI work.
 */
export async function isAuditCancelled(auditRunId: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from('audit_runs')
    .select('status')
    .eq('id', auditRunId)
    .maybeSingle();
  return !data || data.status !== 'running';
}

export async function assertAuditActive(auditRunId: string): Promise<void> {
  if (await isAuditCancelled(auditRunId)) throw new AuditCancelledError();
}
