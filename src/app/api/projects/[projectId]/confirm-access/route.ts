import { NextResponse } from 'next/server';
import { confirmClientAccess } from '@/lib/db/projects';
import { PaidPlanRequiredError, requirePaidSession } from '@/lib/db/profiles';
import { getProjectOverview, ProjectAccessError, requireProjectOwner } from '@/lib/db/projects';

/**
 * "I've granted access" confirmation — either the client confirming their own
 * project, or an admin marking it on a client's behalf (e.g. the client
 * replied by email/phone instead of using the app). Replaces the old
 * reply-to-an-email handoff so admins can see who's ready in /operator.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const session = await requirePaidSession();
    if (session.isAdmin) {
      const project = await getProjectOverview(projectId);
      if (!project) {
        return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
      }
    } else {
      await requireProjectOwner(projectId);
    }
    const project = await confirmClientAccess(projectId);
    return NextResponse.json({ ok: true, confirmedAt: project.client_access_confirmed_at });
  } catch (error) {
    if (error instanceof PaidPlanRequiredError || error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm access.' },
      { status: 500 }
    );
  }
}
