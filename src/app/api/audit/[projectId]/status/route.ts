import { NextResponse } from 'next/server';
import { getAuditSession, getLatestAuditSessionForProject } from '@/lib/db/audit-sessions';
import { ProjectAccessError, requireProjectAccess } from '@/lib/db/projects';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';

/**
 * Lightweight poll endpoint for free-audit progress.
 * Avoids full RSC `router.refresh()` every few seconds while analyzing.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const { projectId: id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  let session = await getAuditSession(id);
  let projectId = session?.project_id ?? null;

  if (!session) {
    const supabase = getSupabaseAdmin();
    const { data: project } = await supabase.from('projects').select('id').eq('id', id).maybeSingle();
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    projectId = project.id;
    session = await getLatestAuditSessionForProject(project.id);
  }

  if (!session || !projectId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await requireProjectAccess(projectId);
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const supabase = getSupabaseAdmin();
  const { data: latestRun } = await supabase
    .from('audit_runs')
    .select('id, status, run_type')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = session.status ?? 'pending';
  const runStatus = typeof latestRun?.status === 'string' ? latestRun.status : null;
  const ready = status === 'free_ready' || status === 'failed';
  const analyzing =
    status !== 'failed' &&
    (status === 'pending' ||
      status === 'teaser_ready' ||
      runStatus === 'running' ||
      (status !== 'free_ready' && runStatus !== 'completed' && runStatus !== 'failed'));

  return NextResponse.json({
    sessionId: session.id,
    projectId,
    status,
    runStatus,
    analyzing,
    ready,
  });
}
