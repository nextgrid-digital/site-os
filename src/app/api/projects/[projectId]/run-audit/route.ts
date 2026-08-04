import { after, NextResponse } from 'next/server';
import { runAudit } from '@/lib/audit/run-audit';
import { getClientIntake } from '@/lib/db/client-intake';
import { PaidPlanRequiredError, requirePaidSession } from '@/lib/db/profiles';
import { getProjectOverview, isFullBriefUnlocked } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export const maxDuration = 300;

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }
    const body = await request.json().catch(() => ({}));
    const runType = body.runType === 'mini' ? 'mini' : 'full';

    if (runType === 'full') {
      await requirePaidSession();
      const project = await getProjectOverview(projectId);
      if (!project) {
        return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
      }
      if (!isFullBriefUnlocked(project)) {
        return NextResponse.json(
          { error: 'Unlock full audit access before running a full audit.' },
          { status: 403 }
        );
      }
    }

    const intake = runType === 'full' ? await getClientIntake(projectId) : null;
    const goalCategory = intake?.goal_category ?? null;

    after(async () => {
      try {
        await runAudit(projectId, runType, goalCategory);
      } catch (error) {
        console.error('[run-audit] background failed', error);
      }
    });

    return NextResponse.json({ status: 'started', projectId, runType });
  } catch (error) {
    if (error instanceof PaidPlanRequiredError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Audit failed.' },
      { status: 500 }
    );
  }
}
