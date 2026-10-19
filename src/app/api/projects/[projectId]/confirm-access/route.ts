import { NextResponse } from 'next/server';
import { confirmClientAccess } from '@/lib/db/projects';
import { requireSignedInSession, SessionRequiredError } from '@/lib/db/profiles';
import { ProjectAccessError, requireProjectOwner } from '@/lib/db/projects';

/**
 * "I've granted access" confirmation from the project's owner.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    await requireSignedInSession();
    await requireProjectOwner(projectId);
    const project = await confirmClientAccess(projectId);
    return NextResponse.json({ ok: true, confirmedAt: project.client_access_confirmed_at });
  } catch (error) {
    if (error instanceof SessionRequiredError || error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm access.' },
      { status: 500 }
    );
  }
}
